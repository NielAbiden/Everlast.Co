"use strict";

module.exports = {
    name: "contract",

    // Role yang boleh menjalankan /v1
    authorizedRoleId: "1356248852063326382",

    // Role yang diberikan setelah contract diterima
    contractRoleId: "1358447978943086834",

    contract: {
        title: "Everlast.Co Workshop Contract",

        description:
            "Anda mendapatkan tawaran pekerjaan dari Everlast.Co Workshop.\n\n" +
            "Silakan pilih apakah Anda menerima atau menolak contract ini.",

        acceptLabel: "Terima",
        rejectLabel: "Tolak"
    }
};