import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SecondBrain Coach - 닥터가드너 가이드',
  description: 'PARA와 CODE 방법론으로 Second Brain 구축하기',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="font-pretendard">{children}</body>
    </html>
  )
}