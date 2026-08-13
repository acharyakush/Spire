const fs = require("node:fs");
const CryptoJS = require("crypto-js");

const OLD_CRM_ENV_FILE =
    "D:/Signiix Advisors/Spire/.env";

function loadEnvironmentFile(filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error(
            `Environment file not found: ${filePath}`
        );
    }

    const content = fs.readFileSync(
        filePath,
        "utf8"
    );

    const environment = {};

    for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (
            !line ||
            line.startsWith("#") ||
            !line.includes("=")
        ) {
            continue;
        }

        const separator = line.indexOf("=");

        const name = line
            .slice(0, separator)
            .trim();

        let value = line
            .slice(separator + 1)
            .trim();

        if (
            value.length >= 2 &&
            (
                (value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))
            )
        ) {
            value = value.slice(1, -1);
        }

        environment[name] = value;
    }

    return environment;
}

const legacyEnvironment =
    loadEnvironmentFile(
        OLD_CRM_ENV_FILE
    );

const secretKey =
    legacyEnvironment.NEXT_PUBLIC_SECRET_KEY;

if (!secretKey) {
    throw new Error(
        "NEXT_PUBLIC_SECRET_KEY was not found in the old CRM .env file."
    );
}

const encryptionIv =
    CryptoJS.enc.Hex.parse(
        "00000000000000000000000000000000"
    );

const encryptionKey =
    CryptoJS.enc.Hex.parse(
        secretKey
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
            const records =
                JSON.parse(input);

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

                const decrypted =
                    decrypt(
                        record.password
                    );

                if (!decrypted) {
                    throw new Error(
                        `Decryption returned an empty password for ${record.id}.`
                    );
                }

                result[record.id] =
                    decrypted;
            }

            /*
             * IMPORTANT:
             * stdout must contain ONLY JSON.
             *
             * Python reads stdout with json.loads().
             * Therefore this file must never print
             * anything else to stdout.
             */
            process.stdout.write(
                JSON.stringify(result)
            );
        } catch (error) {
            /*
             * Errors go to stderr, not stdout.
             * Python can therefore report the real
             * decryptor error instead of receiving
             * corrupted JSON.
             */
            console.error(
                error instanceof Error
                    ? error.message
                    : String(error)
            );

            process.exitCode = 1;
        }
    }
);
