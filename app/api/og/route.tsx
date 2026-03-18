import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export const alt = 'Finanças App - Gestão de Finanças Pessoais';
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Finanças App';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f172a',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#1e293b',
            borderRadius: '40px',
            padding: '60px 80px',
            borderWidth: '4px',
            borderColor: '#FFE100',
            borderStyle: 'solid',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginBottom: '24px',
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 512 512"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path fill="#FFE100" d="M391.533 357.4v.0c-92.16 11.093-183.467 11.093-273.067 0V99.693c86.187-42.667 186.88-42.667 273.067 0v257.707z"/>
              <path fill="#63D3FD" d="M391.533 306.2c-90.453-11.093-184.32-11.093-273.067 0v-76.8c88.747-11.093 182.613-11.093 273.067 0v76.8z"/>
              <path fill="#3DB9F9" d="M365.933 229.4v74.24c8.533.853 17.067 1.707 25.6 2.56v-76.8z"/>
              <path fill="#FFFFFF" d="M118.467 357.4v-257.707c46.933-23.893 98.133-34.133 149.333-32.426-42.667 1.707-84.48 11.947-123.733 31.573v258.56h-25.6z"/>
            </svg>
            <span
              style={{
                fontSize: '56px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-1px',
              }}
            >
              {title}
            </span>
          </div>
          <span
            style={{
              fontSize: '28px',
              color: '#94a3b8',
              textAlign: 'center',
            }}
          >
            Aplicação de gestão de finanças pessoais
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginTop: '40px',
          }}
        >
          <span
            style={{
              fontSize: '22px',
              color: '#64748b',
            }}
          >
            tophatcompany.com.br
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
