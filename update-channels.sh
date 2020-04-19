curl "https://overrustlelogs.net/api/v1/channels.json" > channels.json
curl "https://overrustlelogs.net/api/v1/channels.json" | jq --raw-output 'join("\n")' > channels.txt
