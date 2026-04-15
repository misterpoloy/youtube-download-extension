# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅ Yes    |

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report them privately by emailing the maintainers or using [GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability).

Include as much detail as possible:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested mitigations

You can expect an acknowledgment within **48 hours** and a resolution plan within **7 days**.

## Important Notes on Cookies

Pegasus accepts a Netscape-format `cookies.txt` file to authenticate with YouTube. This file contains sensitive session tokens.

- **Never commit `cookies.txt` to version control** — it is listed in `.gitignore`
- **Never share your cookies file** with anyone
- Cookies are only sent to `127.0.0.1:8765` (your local bridge) — they are never transmitted to any external server by this project
