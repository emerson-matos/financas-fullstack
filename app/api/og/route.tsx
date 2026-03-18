import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { APP_URL } from '@/lib/constants';

export const runtime = 'edge';

export const alt = 'Finanças App - Gestão de Finanças Pessoais';
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Finanças App';

  const domain = APP_URL.replace(/^https?:\/\//, '');

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
              <path fill="#FFE100" d="M391.533 357.4L391.533 357.4c-92.16 11.093-183.467 11.093-273.067 0V99.693c86.187-42.667 186.88-42.667 273.067 0V357.4z"/>
              <path fill="#63D3FD" d="M391.533 306.2c-90.453-11.093-184.32-11.093-273.067 0v-76.8c88.747-11.093 182.613-11.093 273.067 0V306.2z"/>
              <path fill="#FFE100" d="M391.533 333.507V357.4c-92.16 11.093-183.467 11.093-273.067 0v-23.893C51.907 343.747 7.533 362.52 7.533 383c0 33.28 110.933 59.733 247.467 59.733S502.467 416.28 502.467 383C502.467 362.52 458.093 343.747 391.533 333.507z"/>
              <path fill="#FFA800" d="M391.533 357.4L391.533 357.4V99.693l0 0C344.6 75.8 293.4 65.56 242.2 67.267c42.667 1.707 84.48 11.947 123.733 31.573l0 0V357.4H391.533z"/>
              <path fill="#3DB9F9" d="M365.933 229.4L365.933 229.4v74.24c8.533.853 17.067 1.707 25.6 2.56v-76.8z"/>
              <path fill="#FFA800" d="M391.533 333.507v5.12c52.053 11.093 85.333 27.307 85.333 45.227c0 31.573-104.107 58.027-234.667 59.733c4.267 0 8.533 0 12.8 0c136.533 0 247.467-26.453 247.467-59.733C502.467 362.52 458.093 343.747 391.533 333.507z"/>
              <g>
                <path fill="#FFFFFF" d="M118.467 357.4L118.467 357.4V99.693C165.4 75.8 216.6 65.56 267.8 67.267c-42.667 1.707-84.48 11.947-123.733 31.573V357.4H118.467z"/>
                <path fill="#FFFFFF" d="M118.467 333.507v5.12C66.413 348.867 33.133 365.08 33.133 383c0 31.573 104.107 58.027 234.667 59.733c-4.267 0-8.533 0-12.8 0C118.467 442.733 7.533 416.28 7.533 383C7.533 361.667 51.907 343.747 118.467 333.507z"/>
              </g>
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
            {domain}
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
