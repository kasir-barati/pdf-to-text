import {
  act,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { logger } from '../lib/logger';
import { TextOutput } from './TextOutput';

describe('TextOutput', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows "Copied!" after a successful copy, then reverts', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(<TextOutput text="hello" />);
    await act(async () => {
      fireEvent.click(screen.getByText('Copy to clipboard'));
    });

    expect(writeText).toHaveBeenCalledWith('hello');
    expect(screen.getByText('Copied!')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
  });

  it('shows "Copy failed" and logs when clipboard access is denied', async () => {
    const error = new Error('permission denied');
    const writeText = vi.fn().mockRejectedValue(error);
    Object.assign(navigator, { clipboard: { writeText } });
    const loggerError = vi
      .spyOn(logger, 'error')
      .mockImplementation(() => {});

    render(<TextOutput text="hello" />);
    await act(async () => {
      fireEvent.click(screen.getByText('Copy to clipboard'));
    });

    expect(screen.getByText('Copy failed')).toBeInTheDocument();
    expect(loggerError).toHaveBeenCalledWith(
      'Failed to copy text to clipboard',
      error,
    );

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('Copy to clipboard')).toBeInTheDocument();
  });
});
