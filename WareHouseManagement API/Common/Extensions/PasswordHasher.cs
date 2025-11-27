using System.Security.Cryptography;
using System.Text;

namespace Common.Extensions;

public static class PasswordHasher
{
    public static string ComputeStringToSha256Hash(string plainText)
    {
        using var sha256Hash = SHA256.Create();
        byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(plainText));

        var sb = new StringBuilder();
        foreach (var b in bytes)
            sb.Append(b.ToString("x2"));

        return sb.ToString();
    }
}
