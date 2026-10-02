/** @type {import('next').NextConfig} */
module.exports = {
  distDir: process.env.EXAM_PREVIEW === "1" ? ".local/exam-next" : ".next",
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: '4mb' } },
}
