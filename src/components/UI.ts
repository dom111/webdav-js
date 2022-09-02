import supportsEvent, { supportsEvents } from '../lib/supportsEvent';
import AbstractUI from '../lib/AbstractUI';
import handleFileUpload from '../lib/handleFileUpload';

export class UI extends AbstractUI {
  protected bindEvents(): void {
    const isTouch = supportsEvent('touchstart'),
      supportsDragDrop = supportsEvents('dragstart', 'drop');

    // DOM events
    if (isTouch) {
      this.addClass('is-touch');
    }

    if (!supportsDragDrop) {
      this.addClass('no-drag-drop');
    }

    if (supportsDragDrop) {
      this.onEach(['dragenter', 'dragover'], (event: DragEvent): void => {
        event.preventDefault();
        event.stopPropagation();

        this.addClass('active');
      });

      this.onEach(['dragleave', 'drop'], (event: DragEvent): void => {
        event.preventDefault();
        event.stopPropagation();

        this.removeClass('active');
      });

      this.on('drop', async (event: DragEvent): Promise<void> => {
        const { files } = event.dataTransfer;

        for (const file of files) {
          await handleFileUpload(this.dav(), this.state(), file);
        }
      });
    }
  }
}

export default UI;
