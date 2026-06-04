import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Scheduler from '../Scheduler';

// Mock assets to avoid image imports and icon component issues
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
        dummyPostsData: [
            {
                _id: 'scheduled-1',
                user: 'user-1',
                content: 'Upcoming scheduled post',
                platforms: ['twitter'],
                scheduledFor: '2099-12-31T10:00:00.000Z',
                status: 'scheduled',
                createdAt: '2026-05-01T00:00:00.000Z',
                updatedAt: '2026-05-01T00:00:00.000Z',
            },
            {
                _id: 'published-1',
                user: 'user-1',
                content: 'A published post',
                platforms: ['linkedin'],
                scheduledFor: '2026-05-08T08:05:00.000Z',
                status: 'published',
                createdAt: '2026-05-08T08:04:04.397Z',
                updatedAt: '2026-05-08T08:05:02.523Z',
            },
        ],
    };
});

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Calendar: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'calendar-icon', ...props }),
    Clock: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'clock-icon', ...props }),
    Send: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'send-icon', ...props }),
    ArrowRight: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'arrow-right-icon', ...props }),
    X: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'x-icon', ...props }),
    Image: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'image-icon', ...props }),
    AlertCircle: (props: React.SVGProps<SVGSVGElement>) =>
        React.createElement('svg', { 'data-testid': 'alert-icon', ...props }),
}));

/**
 * Helper: create a fake File object with a given type.
 */
function createFakeFile(name: string, type: string): File {
    return new File(['content'], name, { type });
}

describe('Scheduler – changed code (PR diff)', () => {
    let createObjectURLMock: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLMock: ReturnType<typeof vi.spyOn>;
    let alertMock: ReturnType<typeof vi.spyOn>;
    const FAKE_BLOB_URL = 'blob:http://localhost/fake-object-url';

    beforeEach(() => {
        createObjectURLMock = vi
            .spyOn(URL, 'createObjectURL')
            .mockReturnValue(FAKE_BLOB_URL);
        revokeObjectURLMock = vi
            .spyOn(URL, 'revokeObjectURL')
            .mockImplementation(() => {});
        alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    });

    afterEach(() => {
        createObjectURLMock.mockRestore();
        revokeObjectURLMock.mockRestore();
        alertMock.mockRestore();
    });

    // ─── handleFileChange: mediaPreview becomes {url, type} object ────────────

    it('sets mediaPreview to an object with url and type when an image file is selected', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = createFakeFile('photo.png', 'image/png');

        fireEvent.change(fileInput, { target: { files: [file] } });

        // After change, an <img> (not <video>) should be rendered for image type
        const img = await screen.findByAltText('Preview');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', FAKE_BLOB_URL);
    });

    it('calls URL.createObjectURL with the selected file', () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = createFakeFile('photo.jpg', 'image/jpeg');

        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(createObjectURLMock).toHaveBeenCalledWith(file);
    });

    it('stores the MIME type alongside the URL in mediaPreview', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        const file = createFakeFile('clip.mp4', 'video/mp4');

        fireEvent.change(fileInput, { target: { files: [file] } });

        // Video type → <video> element should appear
        const video = await screen.findByRole('presentation', { hidden: true }).catch(
            () => document.querySelector('video')
        ) as HTMLVideoElement | null;

        // Fallback: check DOM directly
        await waitFor(() => {
            const videoEl = document.querySelector('video');
            expect(videoEl).not.toBeNull();
            expect(videoEl!.src).toContain(FAKE_BLOB_URL);
        });
    });

    // ─── Render: video element for video/* type ───────────────────────────────

    it('renders a <video> element (not <img>) when the file type is video/*', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('movie.mp4', 'video/mp4')] } });

        await waitFor(() => {
            expect(document.querySelector('video')).toBeInTheDocument();
            expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
        });
    });

    it('renders a <video> element with the correct src for video type', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('clip.webm', 'video/webm')] } });

        await waitFor(() => {
            const videoEl = document.querySelector('video') as HTMLVideoElement;
            expect(videoEl).toBeInTheDocument();
            expect(videoEl.src).toContain(FAKE_BLOB_URL);
        });
    });

    it('renders a <video> element with controls attribute for video type', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('vid.mp4', 'video/mp4')] } });

        await waitFor(() => {
            const videoEl = document.querySelector('video');
            expect(videoEl).toHaveAttribute('controls');
        });
    });

    // ─── Render: img element for image/* type ────────────────────────────────

    it('renders an <img> element (not <video>) when the file type is image/*', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('pic.jpg', 'image/jpeg')] } });

        await waitFor(() => {
            expect(screen.getByAltText('Preview')).toBeInTheDocument();
            expect(document.querySelector('video')).not.toBeInTheDocument();
        });
    });

    it('renders <img> with the blob URL as src for image type', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('banner.png', 'image/png')] } });

        await waitFor(() => {
            const img = screen.getByAltText('Preview');
            expect(img).toHaveAttribute('src', FAKE_BLOB_URL);
        });
    });

    // ─── handleRemoveMedia: URL.revokeObjectURL is called ─────────────────────

    it('calls URL.revokeObjectURL with the preview URL when media is removed', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('img.png', 'image/png')] } });

        await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());

        // Hover the preview to reveal the remove button, then click it
        const previewContainer = screen.getByAltText('Preview').closest('div')!;
        fireEvent.mouseEnter(previewContainer);

        const removeBtn = previewContainer.querySelector('button');
        expect(removeBtn).not.toBeNull();
        fireEvent.click(removeBtn!);

        expect(revokeObjectURLMock).toHaveBeenCalledWith(FAKE_BLOB_URL);
    });

    it('removes the preview UI after clicking the remove button', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('img.png', 'image/png')] } });

        await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());

        const previewContainer = screen.getByAltText('Preview').closest('div')!;
        const removeBtn = previewContainer.querySelector('button')!;
        fireEvent.click(removeBtn);

        await waitFor(() => {
            expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
        });
    });

    it('does NOT call URL.revokeObjectURL when mediaPreview is null (no file selected)', () => {
        render(<Scheduler />);
        // No file selected; mediaPreview is null
        // Verify that revokeObjectURL is not called spuriously at mount
        expect(revokeObjectURLMock).not.toHaveBeenCalled();
    });

    // ─── Regression: replacing a file revokes the previous blob URL ──────────

    it('revokes the previous blob URL when a new file replaces the current one via handleSchedule reset', async () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        fireEvent.change(fileInput, { target: { files: [createFakeFile('first.png', 'image/png')] } });

        await waitFor(() => expect(screen.getByAltText('Preview')).toBeInTheDocument());

        // Fill out required form fields and submit to trigger reset (which calls handleRemoveMedia)
        const platformIcons = screen.getAllByTestId('mock-icon');
        // Find platform buttons (click first platform icon area)
        const platformButtons = Array.from(document.querySelectorAll('button')).filter(
            btn => btn.querySelector('[data-testid="mock-icon"]')
        );
        fireEvent.click(platformButtons[0]);

        const textarea = screen.getByPlaceholderText(/What do you want to share/i);
        await userEvent.type(textarea, 'Test post content');

        fireEvent.change(document.querySelector('input[type="date"]')!, {
            target: { value: '2026-12-31' },
        });
        fireEvent.change(document.querySelector('input[type="time"]')!, {
            target: { value: '10:00' },
        });

        const scheduleBtn = screen.getByRole('button', { name: /Schedule Post/i });
        fireEvent.click(scheduleBtn);

        // alert is shown, and handleRemoveMedia is called internally which revokes the URL
        expect(alertMock).toHaveBeenCalledWith('Post scheduled successfully!');
        expect(revokeObjectURLMock).toHaveBeenCalledWith(FAKE_BLOB_URL);
    });

    // ─── Edge case: file input with no files does not crash ──────────────────

    it('does not update mediaPreview when the file input is cleared (no files)', () => {
        render(<Scheduler />);
        const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

        // Fire change with empty FileList
        fireEvent.change(fileInput, { target: { files: [] } });

        expect(screen.queryByAltText('Preview')).not.toBeInTheDocument();
        expect(document.querySelector('video')).not.toBeInTheDocument();
    });
});