/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // ビルド時にESLintエラーを無視（警告として扱う）
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScriptエラーを無視（ビルド時）
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 