import { EmailService } from '@core/email/email.service';
import type { ConfigService } from '@nestjs/config';

function cfg(values: Record<string, string>): ConfigService {
  return {
    get: <T>(k: string, d?: T) => (values[k] as unknown as T) ?? d,
  } as unknown as ConfigService;
}

describe('EmailService', () => {
  const ORIGINAL_FETCH = global.fetch;
  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    jest.restoreAllMocks();
  });

  it('isEnabled is false when RESEND_API_KEY is empty', () => {
    expect(new EmailService(cfg({})).isEnabled()).toBe(false);
    expect(new EmailService(cfg({ RESEND_API_KEY: 're_x' })).isEnabled()).toBe(
      true
    );
  });

  it('send returns skipped and makes NO network call when disabled', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
    const svc = new EmailService(cfg({}));
    const res = await svc.send({
      to: 'a@b.com',
      subject: 's',
      html: '<p>x</p>',
      text: 'x',
    });
    expect(res.status).toBe('skipped');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
