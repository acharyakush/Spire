require("dotenv").config();

const CryptoJS = require("crypto-js");

const encryptionIv = CryptoJS.enc.Hex.parse(
    "00000000000000000000000000000000"
);

const encryptionKey = CryptoJS.enc.Hex.parse(
    process.env.NEXT_PUBLIC_SECRET_KEY
);

function decrypt(value) {
    return CryptoJS.AES.decrypt(
        value,
        encryptionKey,
        {
            iv: encryptionIv,
        }
    ).toString(
        CryptoJS.enc.Utf8
    );
}

let input = "";

process.stdin.setEncoding("utf8");

process.stdin.on(
    "data",
    (chunk) => {
        input += chunk;
    }
);

process.stdin.on(
    "end",
    () => {
        try {
            const records = JSON.parse(input);

            if (!Array.isArray(records)) {
                throw new Error(
                    "Expected an array of password records."
                );
            }

            const result = {};

            for (const record of records) {
                if (
                    !record ||
                    typeof record.id !== "string" ||
                    typeof record.password !== "string"
                ) {
                    throw new Error(
                        "Invalid password record received."
                    );
                }

                const decrypted = decrypt(
                    record.password
                );

                if (!decrypted) {
                    throw new Error(
                        `Decryption returned an empty password for ${record.id}.`
                    );
                }

                result[record.id] = decrypted;
            }

            /*
             * IMPORTANT:
             * Only JSON is written to stdout.
             *
             * The Python migration process consumes stdout.
             * Never add console.log() here.
             */
            process.stdout.write(
                JSON.stringify(result)
            );
        } catch (error) {
            console.error(
                error instanceof Error
                    ? error.message
                    : String(error)
            );

            process.exitCode = 1;
        }
    }
);
