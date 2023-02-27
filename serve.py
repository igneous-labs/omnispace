#!/usr/bin/env python3

from http import server

class HTTPRequestHandler(server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_coi_headers()
        super().end_headers()

    def send_coi_headers(self):
        self.send_header("cross-origin-resource-policy", "cross-origin")
        self.send_header("cross-origin-opener-policy", "same-origin")
        self.send_header("cross-origin-embedder-policy", "require-corp")

if __name__ == "__main__":
    addr = ("", 8003)
    httpd = server.HTTPServer(addr, HTTPRequestHandler)
    httpd.serve_forever()