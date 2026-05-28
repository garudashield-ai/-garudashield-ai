// new release garudashield source
export function analyzeApkHeuristics(aaptStdout: string, fileName: string) {
  let score = 0;
  let nativeReport = `## Analisis Sistem GarudaShield (Heuristik)\n\n`;
  const fileNameLower = fileName.toLowerCase();

  if (
    fileNameLower.includes("undangan") ||
    fileNameLower.includes("kurir") ||
    fileNameLower.includes("jnt") ||
    fileNameLower.includes("resi") ||
    fileNameLower.includes("tagihan")
  ) {
    score += 5;
    nativeReport += `- 🚫 **Indikator Scam (Nama File)**: Terdapat kata kunci 'undangan', 'kurir', 'resi', atau 'tagihan'. Ini adalah modus penipuan APK yang sangat umum di Indonesia.\n`;
  }

  if (aaptStdout !== "ERROR_NO_AAPT") {
    const aaptLower = aaptStdout.toLowerCase();
    if (
      aaptLower.includes("package: name='com.example") ||
      aaptLower.includes("package: name='test.")
    ) {
      score += 2;
      nativeReport += `- ⚠️ **Indikator Mencurigakan (Package)**: Menggunakan package name default (com.example), ciri-ciri aplikasi yang tidak dipublikasikan ke Play Store secara resmi.\n`;
    }

    if (
      aaptLower.includes("android.permission.read_sms") ||
      aaptLower.includes("android.permission.receive_sms")
    ) {
      score += 2;
      nativeReport += `- ⚠️ **Indikator Peringatan (Permission)**: Meminta akses membaca SMS. Sering digunakan untuk OTP Autofill, tapi juga berpotensi disalahgunakan malware.\n`;
    }
    if (aaptLower.includes("android.permission.read_contacts")) {
      score += 2;
      nativeReport += `- ⚠️ **Indikator Peringatan (Permission)**: Meminta akses membaca kontak. Bisa wajar untuk fitur sosial, atau disalahgunakan spam.\n`;
    }

    const explicitRatSignatures = [
      "com.metasploit.stage",
      "com.cerberus",
      "com.ahmyth",
      "com.spymax",
      "com.craxsrat",
      "com.dcrat",
      "com.droidjack",
      "com.androrat",
      "com.njrat",
      "org.sandroproxy",
      "label='whatsapp tracker'",
      "label='hack '",
      "label='spy '",
      "label='free diamon'",
      "label='dana kaget'",
      "com.tencent.stub",
      "com.qihoo.util",
      "secneo",
      "ijiami",
    ];

    const highRiskPermissions = [
      "android.permission.bind_accessibility_service",
      "android.permission.bind_device_admin",
      "android.permission.request_install_packages",
      "android.permission.process_outgoing_calls",
      "android.permission.read_call_log",
      "android.permission.write_call_log",
      "android.permission.send_sms",
      "android.permission.receive_wap_push",
      "android.provider.telephony.sms_received",
      "android.app.action.device_admin_enabled",
    ];

    const normalPermissions = [
      "android.permission.system_alert_window",
      "android.permission.record_audio",
      "android.permission.camera",
      "android.permission.read_phone_state",
      "android.permission.get_accounts",
      "android.permission.write_settings",
      "android.permission.receive_boot_completed",
    ];

    let matchedRatSigs: string[] = [];
    explicitRatSignatures.forEach((sig) => {
      if (aaptLower.includes(sig)) matchedRatSigs.push(sig);
    });

    let matchedHighRiskPerms: string[] = [];
    highRiskPermissions.forEach((sig) => {
      if (aaptLower.includes(sig)) matchedHighRiskPerms.push(sig);
    });

    let matchedNormalPerms: string[] = [];
    normalPermissions.forEach((sig) => {
      if (aaptLower.includes(sig)) matchedNormalPerms.push(sig);
    });

    const hasAccessibilityAbuse = matchedHighRiskPerms.includes(
      "android.permission.bind_accessibility_service",
    );
    const hasAdminAbuse = matchedHighRiskPerms.includes(
      "android.permission.bind_device_admin",
    );

    if (matchedRatSigs.length > 0) {
      score += 90;
      nativeReport += `- ☣️ **DETEKSI MALWARE LOKAL (RAT)**: Ditemukan signature malware/RAT: \`${matchedRatSigs.slice(0, 4).join(", ")}\`.\n`;
    } else if (hasAccessibilityAbuse && matchedHighRiskPerms.length >= 3) {
      score += 90;
      nativeReport += `- ☣️ **INDIKASI SPYWARE TINGGI**: Menyalahgunakan aksesibilitas dan izin sensitif lainnya: \`${matchedHighRiskPerms.slice(0, 4).join(", ")}\`.\n`;
    } else if (matchedHighRiskPerms.length >= 4) {
      score += 3;
      nativeReport += `- ⚠️ **Banyak Izin Sensitif**: Aplikasi meminta terlalu banyak izin berisiko tinggi: \`${matchedHighRiskPerms.slice(0, 4).join(", ")}\`.\n`;
    }

    if (matchedNormalPerms.length > 0 && score === 0) {
      nativeReport += `- ℹ️ **Info Izin Standar**: Aplikasi menggunakan fitur seperti: \`${matchedNormalPerms.slice(0, 3).join(", ")}\` yang wajar untuk banyak aplikasi.\n`;
    }
  } else {
    nativeReport += `- ⚠️ **Sistem:** Tidak dapat membedah isi APK secara mendalam (modul aapt tidak merespon). Analisis hanya berdasarkan nama file.\n`;
    score += 1;
  }

  return { score, nativeReport };
}
