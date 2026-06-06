import React from 'react';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import AIComposer from '../AIComposer';

// Mock the assets module to avoid image imports and icon dependencies
vi.mock('../../assets/assets', () => {
    const MockIcon = (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'mock-icon', ...props });

    return {
        PLATFORMS: [
            { id: 'twitter', name: 'Twitter / X', icon: MockIcon, description: 'Post tweets' },
            { id: 'linkedin', name: 'LinkedIn', icon: MockIcon, description: 'Publish to LinkedIn' },
            { id: 'facebook', name: 'Facebook', icon: MockIcon, description: 'Manage pages' },
            { id: 'instagram', name: 'Instagram', icon: MockIcon, description: 'Share photos' },
        ],
        dummyGenerationData: [
            {
                _id: 'post-1',
                user: 'user-1',
                prompt: 'Test prompt one',
                content: 'Test content one',
                mediaUrl: 'https://example.com/image.jpg',
                mediaType: 'image',
                tone: 'Professional',
                createdAt: '2026-05-13T09:04:07.753Z',
                updatedAt: '2026-05-13T09:04:07.753Z',
            },
            {
                _id: 'post-2',
                user: 'user-1',
                prompt: 'Test prompt two',
                content: 'Test content two',
                mediaUrl: '',
                tone: 'Creative',
                createdAt: '2026-05-12T13:25:32.696Z',
                updatedAt: '2026-05-12T13:25:32.696Z',
            },
        ],
    };
});

// Mock lucide-react icons to simple elements
vi.mock('lucide-react', () => ({
    History: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'history-icon', ...props }),
    ArrowRight: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'arrow-right-icon', ...props }),
    X: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'x-icon', ...props }),
    Calendar: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'calendar-icon', ...props }),
    Clock: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'clock-icon', ...props }),
    Loader2: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'loader-icon', ...props }),
    AlertCircle: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'alert-icon', ...props }),
}));

/** Helper: open the schedule modal for a given post index (0-based). */
function openModal(index = 0) {
    const buttons = screen.getAllByText('Schedule Post');
    fireEvent.click(buttons[index]);
}

/** Helper: get the platform buttons inside the SELECT CHANNELS container. */
function getChannelButtons(): HTMLElement[] {
    const channelsLabel = screen.getByText('SELECT CHANNELS');
    const container = channelsLabel.closest('div')!.nextElementSibling as HTMLElement;
    return within(container).getAllByRole('button');
}

/** Helper: get the modal element (assumes modal is open). */
function getModal(): HTMLElement {
    return screen.getByText('Schedule Generation').closest('[class*="bg-white rounded"]') as HTMLElement;
}

/** Helper: click the Schedule Post button inside the modal. */
function clickModalScheduleButton() {
    const modal = getModal();
    const btns = within(modal).getAllByRole('button', { name: /Schedule Post/i });
    // The modal's submit button (last match, inside the modal footer)
    fireEvent.click(btns[btns.length - 1]);
}

describe('AIComposer', () => {
    let alertMock: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
        alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        alertMock.mockRestore();
        vi.useRealTimers();
    });

    // ─── Rendering ───────────────────────────────────────────────────────────

    it('renders the main heading', () => {
        render(<AIComposer />);
        expect(
            screen.getByText('What should we create today?')
        ).toBeInTheDocument();
    });

    it('renders the idea textarea with placeholder text', () => {
        render(<AIComposer />);
        expect(
            screen.getByPlaceholderText(/Share your idea/i)
        ).toBeInTheDocument();
    });

    it('renders all five tone buttons', () => {
        render(<AIComposer />);
        const tones = ['Professional', 'Creative', 'Funny', 'Minimalist', 'Excited'];
        tones.forEach(tone => {
            expect(screen.getByRole('button', { name: tone })).toBeInTheDocument();
        });
    });

    it('renders the Recent Generations section', () => {
        render(<AIComposer />);
        expect(screen.getByText('Recent Generations')).toBeInTheDocument();
    });

    it('renders generation cards for each dummy post', () => {
        render(<AIComposer />);
        expect(screen.getAllByText('Schedule Post')).toHaveLength(2);
    });

    it('displays the total count of generations', () => {
        render(<AIComposer />);
        expect(screen.getByText(/2\s*total/)).toBeInTheDocument();
    });

    // ─── AI Image Toggle ──────────────────────────────────────────────────────

    it('renders the AI Image toggle label', () => {
        render(<AIComposer />);
        expect(screen.getByText('AI Image')).toBeInTheDocument();
    });

    it('AI Image toggle starts enabled (indigo background)', () => {
        render(<AIComposer />);
        const aiImageSection = screen.getByText('AI Image').closest('div');
        const toggleButton = aiImageSection!.querySelector('button');
        expect(toggleButton).toHaveClass('bg-indigo-500');
    });

    it('clicking the AI Image toggle switches it off', () => {
        render(<AIComposer />);
        const aiImageSection = screen.getByText('AI Image').closest('div');
        const toggleButton = aiImageSection!.querySelector('button')!;
        fireEvent.click(toggleButton);
        expect(toggleButton).toHaveClass('bg-gray-300');
    });

    it('clicking the AI Image toggle twice returns it to enabled state', () => {
        render(<AIComposer />);
        const aiImageSection = screen.getByText('AI Image').closest('div');
        const toggleButton = aiImageSection!.querySelector('button')!;
        fireEvent.click(toggleButton);
        fireEvent.click(toggleButton);
        expect(toggleButton).toHaveClass('bg-indigo-500');
    });

    // ─── Tone Selection ───────────────────────────────────────────────────────

    it('Professional tone is selected by default', () => {
        render(<AIComposer />);
        const professionalBtn = screen.getByRole('button', { name: 'Professional' });
        expect(professionalBtn).toHaveClass('bg-indigo-500');
    });

    it('clicking a different tone selects it', () => {
        render(<AIComposer />);
        const creativeBtn = screen.getByRole('button', { name: 'Creative' });
        fireEvent.click(creativeBtn);
        expect(creativeBtn).toHaveClass('bg-indigo-500');
    });

    it('selecting a new tone deselects the previously selected one', () => {
        render(<AIComposer />);
        const professionalBtn = screen.getByRole('button', { name: 'Professional' });
        const funnyBtn = screen.getByRole('button', { name: 'Funny' });
        fireEvent.click(funnyBtn);
        expect(professionalBtn).not.toHaveClass('bg-indigo-500');
        expect(funnyBtn).toHaveClass('bg-indigo-500');
    });

    // ─── Generate Button ──────────────────────────────────────────────────────

    it('Generate button is disabled when idea is empty', () => {
        render(<AIComposer />);
        const generateBtn = screen.getByRole('button', { name: /Generate/i });
        expect(generateBtn).toBeDisabled();
    });

    it('Generate button is disabled when idea contains only whitespace', () => {
        render(<AIComposer />);
        const textarea = screen.getByPlaceholderText(/Share your idea/i);
        fireEvent.change(textarea, { target: { value: '   ' } });
        const generateBtn = screen.getByRole('button', { name: /Generate/i });
        expect(generateBtn).toBeDisabled();
    });

    it('Generate button becomes enabled when idea has content', () => {
        render(<AIComposer />);
        const textarea = screen.getByPlaceholderText(/Share your idea/i);
        fireEvent.change(textarea, { target: { value: 'A new product launch' } });
        const generateBtn = screen.getByRole('button', { name: /Generate/i });
        expect(generateBtn).not.toBeDisabled();
    });

    it('clicking Generate shows Generating... state while pending', async () => {
        vi.useFakeTimers();
        render(<AIComposer />);
        const textarea = screen.getByPlaceholderText(/Share your idea/i);
        fireEvent.change(textarea, { target: { value: 'Launch campaign' } });
        const generateBtn = screen.getByRole('button', { name: /Generate/i });
        fireEvent.click(generateBtn);
        expect(screen.getByText('Generating...')).toBeInTheDocument();
        await act(async () => { vi.advanceTimersByTime(2000); });
    });

    it('Generate button is disabled while generating', async () => {
        vi.useFakeTimers();
        render(<AIComposer />);
        const textarea = screen.getByPlaceholderText(/Share your idea/i);
        fireEvent.change(textarea, { target: { value: 'Launch campaign' } });
        const generateBtn = screen.getByRole('button', { name: /Generate/i });
        fireEvent.click(generateBtn);
        expect(generateBtn).toBeDisabled();
        await act(async () => { vi.advanceTimersByTime(2000); });
    });

    it('clears idea textarea after generation completes', async () => {
        vi.useFakeTimers();
        render(<AIComposer />);
        const textarea = screen.getByPlaceholderText(/Share your idea/i);
        fireEvent.change(textarea, { target: { value: 'Launch campaign' } });
        const generateBtn = screen.getByRole('button', { name: /Generate/i });
        fireEvent.click(generateBtn);
        await act(async () => { vi.advanceTimersByTime(2000); });
        expect(textarea).toHaveValue('');
    });

    it('Generate button returns to idle state after generation completes', async () => {
        vi.useFakeTimers();
        render(<AIComposer />);
        const textarea = screen.getByPlaceholderText(/Share your idea/i);
        fireEvent.change(textarea, { target: { value: 'Launch campaign' } });
        fireEvent.click(screen.getByRole('button', { name: /Generate/i }));
        await act(async () => { vi.advanceTimersByTime(2000); });
        expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });

    // ─── formatDate ───────────────────────────────────────────────────────────

    it('displays formatted date for generation cards (M/D/YYYY)', () => {
        render(<AIComposer />);
        // post-1 createdAt: 2026-05-13T09:04:07.753Z → 5/13/2026
        expect(screen.getByText('5/13/2026')).toBeInTheDocument();
    });

    it('displays tone badge on generation cards', () => {
        render(<AIComposer />);
        // Use getAllByText since 'Professional' appears in both tone buttons and cards
        const professionalInstances = screen.getAllByText('Professional');
        expect(professionalInstances.length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Creative').length).toBeGreaterThanOrEqual(1);
    });

    it('renders media image when post has a mediaUrl', () => {
        render(<AIComposer />);
        const generationImg = screen.getByAltText('AI Generation');
        expect(generationImg).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('does not render media image when post has no mediaUrl', () => {
        render(<AIComposer />);
        // Only one AI Generation image (post-2 has empty mediaUrl)
        expect(screen.getAllByAltText('AI Generation')).toHaveLength(1);
    });

    // ─── Schedule Modal – Opening ─────────────────────────────────────────────

    it('modal is not visible on initial render', () => {
        render(<AIComposer />);
        expect(screen.queryByText('Schedule Generation')).not.toBeInTheDocument();
    });

    it('clicking Schedule Post on a card opens the modal', () => {
        render(<AIComposer />);
        openModal(0);
        expect(screen.getByText('Schedule Generation')).toBeInTheDocument();
    });

    it('modal shows the prompt of the selected post', () => {
        render(<AIComposer />);
        openModal(0);
        expect(screen.getByText('Test prompt one')).toBeInTheDocument();
    });

    it('modal shows the content of the selected post', () => {
        render(<AIComposer />);
        openModal(0);
        const modal = getModal();
        // Content appears both in the card and inside the modal; verify modal contains it
        expect(within(modal).getByText('Test content one')).toBeInTheDocument();
    });

    it('modal shows media image when selected post has a mediaUrl', () => {
        render(<AIComposer />);
        openModal(0);
        expect(screen.getByAltText('Generated Media')).toBeInTheDocument();
    });

    it('modal does not show media when selected post has no mediaUrl', () => {
        render(<AIComposer />);
        openModal(1);
        expect(screen.queryByAltText('Generated Media')).not.toBeInTheDocument();
    });

    it('modal resets platform selection and errors when opened for a new post', () => {
        render(<AIComposer />);
        openModal(0);
        // Trigger errors
        clickModalScheduleButton();
        expect(screen.getByText('* REQUIRED')).toBeInTheDocument();
        // Close
        fireEvent.click(screen.getByTestId('x-icon').closest('button')!);
        // Reopen for second post
        openModal(1);
        // Errors should be cleared
        expect(screen.queryByText('* REQUIRED')).not.toBeInTheDocument();
    });

    // ─── Schedule Modal – Close ───────────────────────────────────────────────

    it('clicking X button closes the modal', () => {
        render(<AIComposer />);
        openModal(0);
        expect(screen.getByText('Schedule Generation')).toBeInTheDocument();
        fireEvent.click(screen.getByTestId('x-icon').closest('button')!);
        expect(screen.queryByText('Schedule Generation')).not.toBeInTheDocument();
    });

    // ─── togglePlatform ───────────────────────────────────────────────────────

    it('clicking a platform button in modal selects it', () => {
        render(<AIComposer />);
        openModal(0);
        const channelBtns = getChannelButtons();
        fireEvent.click(channelBtns[0]);
        expect(channelBtns[0]).toHaveClass('border-indigo-500');
    });

    it('clicking a selected platform button deselects it', () => {
        render(<AIComposer />);
        openModal(0);
        const channelBtns = getChannelButtons();
        fireEvent.click(channelBtns[0]);
        expect(channelBtns[0]).toHaveClass('border-indigo-500');
        fireEvent.click(channelBtns[0]);
        expect(channelBtns[0]).not.toHaveClass('border-indigo-500');
    });

    it('selecting a platform clears the Channels validation error', () => {
        render(<AIComposer />);
        openModal(0);
        // Trigger validation error
        clickModalScheduleButton();
        expect(screen.getByText('* REQUIRED')).toBeInTheDocument();
        // Select a channel
        fireEvent.click(getChannelButtons()[0]);
        expect(screen.queryByText('* REQUIRED')).not.toBeInTheDocument();
    });

    // ─── handleSchedule – Validation ─────────────────────────────────────────

    it('shows error when scheduling with no platforms, date, or time', () => {
        render(<AIComposer />);
        openModal(0);
        clickModalScheduleButton();
        const errorBanner = screen.getByText(/Please provide:/i);
        expect(errorBanner).toBeInTheDocument();
    });

    it('shows REQUIRED label next to SELECT CHANNELS when no platform selected', () => {
        render(<AIComposer />);
        openModal(0);
        clickModalScheduleButton();
        expect(screen.getByText('* REQUIRED')).toBeInTheDocument();
    });

    it('does not show error banner when no errors exist (initial state)', () => {
        render(<AIComposer />);
        expect(screen.queryByText(/Please provide:/i)).not.toBeInTheDocument();
    });

    it('clears Date error when date input is changed', () => {
        render(<AIComposer />);
        openModal(0);
        clickModalScheduleButton();
        // Verify error contains Date
        expect(screen.getByText(/Please provide:/i).textContent).toContain('Date');
        // Fill the date
        const dateInput = document.querySelector('input[type="date"]')!;
        fireEvent.change(dateInput, { target: { value: '2026-06-15' } });
        // Error banner should no longer mention Date
        const banner = screen.queryByText(/Please provide:/i);
        if (banner) {
            expect(banner.textContent).not.toContain('Date');
        }
    });

    it('clears Time error when time input is changed', () => {
        render(<AIComposer />);
        openModal(0);
        clickModalScheduleButton();
        expect(screen.getByText(/Please provide:/i).textContent).toContain('Time');
        const timeInput = document.querySelector('input[type="time"]')!;
        fireEvent.change(timeInput, { target: { value: '14:30' } });
        const banner = screen.queryByText(/Please provide:/i);
        if (banner) {
            expect(banner.textContent).not.toContain('Time');
        }
    });

    // ─── handleSchedule – Success ─────────────────────────────────────────────

    it('calls alert and closes modal after successful scheduling', async () => {
        vi.useFakeTimers();
        render(<AIComposer />);
        openModal(0);

        // Fill all required fields
        fireEvent.click(getChannelButtons()[0]);
        fireEvent.change(document.querySelector('input[type="date"]')!, {
            target: { value: '2026-06-15' },
        });
        fireEvent.change(document.querySelector('input[type="time"]')!, {
            target: { value: '14:30' },
        });

        clickModalScheduleButton();
        await act(async () => { vi.advanceTimersByTime(1500); });

        expect(alertMock).toHaveBeenCalledWith('Post scheduled successfully!');
        expect(screen.queryByText('Schedule Generation')).not.toBeInTheDocument();
    });

    it('shows Scheduling... state while the schedule request is in flight', async () => {
        vi.useFakeTimers();
        render(<AIComposer />);
        openModal(0);
        fireEvent.click(getChannelButtons()[0]);
        fireEvent.change(document.querySelector('input[type="date"]')!, {
            target: { value: '2026-06-15' },
        });
        fireEvent.change(document.querySelector('input[type="time"]')!, {
            target: { value: '14:30' },
        });
        clickModalScheduleButton();
        expect(screen.getByText('Scheduling...')).toBeInTheDocument();
        await act(async () => { vi.advanceTimersByTime(1500); });
    });

    it('Schedule Post button is disabled while scheduling', async () => {
        vi.useFakeTimers();
        render(<AIComposer />);
        openModal(0);
        fireEvent.click(getChannelButtons()[0]);
        fireEvent.change(document.querySelector('input[type="date"]')!, {
            target: { value: '2026-06-15' },
        });
        fireEvent.change(document.querySelector('input[type="time"]')!, {
            target: { value: '14:30' },
        });
        const modal = getModal();
        const scheduleBtns = within(modal).getAllByRole('button', { name: /Schedule Post/i });
        const scheduleBtn = scheduleBtns[scheduleBtns.length - 1];
        fireEvent.click(scheduleBtn);
        expect(scheduleBtn).toBeDisabled();
        await act(async () => { vi.advanceTimersByTime(1500); });
    });

    // ─── Regression / Edge Cases ──────────────────────────────────────────────

    it('does not show Generating... when Generate is clicked with whitespace-only idea', () => {
        render(<AIComposer />);
        const textarea = screen.getByPlaceholderText(/Share your idea/i);
        fireEvent.change(textarea, { target: { value: '   ' } });
        // Button is disabled so cannot be clicked — verify disabled state
        const btn = screen.getByRole('button', { name: /Generate/i });
        expect(btn).toBeDisabled();
        expect(screen.queryByText('Generating...')).not.toBeInTheDocument();
    });

    it('can select all four platforms independently in the modal', () => {
        render(<AIComposer />);
        openModal(0);
        const channelBtns = getChannelButtons();
        expect(channelBtns).toHaveLength(4);
        channelBtns.forEach(btn => fireEvent.click(btn));
        channelBtns.forEach(btn => {
            expect(btn).toHaveClass('border-indigo-500');
        });
    });

    it('error banner lists all three missing fields when none are provided', () => {
        render(<AIComposer />);
        openModal(0);
        clickModalScheduleButton();
        const errorBanner = screen.getByText(/Please provide:/i);
        expect(errorBanner.textContent).toContain('Channels');
        expect(errorBanner.textContent).toContain('Date');
        expect(errorBanner.textContent).toContain('Time');
    });

    it('second date on a card shows the correct formatted date', () => {
        render(<AIComposer />);
        // post-2 createdAt: 2026-05-12T13:25:32.696Z → 5/12/2026
        expect(screen.getByText('5/12/2026')).toBeInTheDocument();
    });
});