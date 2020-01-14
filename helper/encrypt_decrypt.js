const crypto = require("crypto");

let resizeIv = Buffer.allocUnsafe(16);
let iv = crypto.createHash("sha256").update("randomIV").digest();
iv.copy(resizeIv);
let authTag;
const encrypt_decrypt = (flag, key, phrase) => {
    let hash = crypto.createHash("sha256").update(key).digest();
    if(flag == 0) //encryption
    {
        let cipher = crypto.createCipheriv("aes-256-gcm", hash, iv);
        let encrypted = cipher.update(phrase, "utf-8", "hex");
        encrypted += cipher.final("hex");
        authTag = cipher.getAuthTag();
        return encrypted;
    }
    else
    {
        let decipher = crypto.createDecipheriv("aes-256-gcm", hash, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(phrase, "hex", "utf-8");
        decrypted += decipher.final("utf-8");
        return decrypted;
    } 
}

module.exports = encrypt_decrypt;