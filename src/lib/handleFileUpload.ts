import DAV from './DAV';
import Entry from './Entry';
import State from './State';
import joinPath from './joinPath';
import { success } from 'melba-toast';
import { t } from 'i18next';

export const handleFileUpload = async (
  dav: DAV,
  state: State,
  file: File
): Promise<void> => {
  const collection = await dav.list(state.getPath(), true);

  if (!collection) {
    return;
  }

  state.setCollection(collection);

  const [existingFile] = collection.filter(
    (entry: Entry): boolean => entry.name === file.name
  );

  if (existingFile) {
    // TODO: nicer notification
    if (
      !confirm(
        t('overwriteFileConfirmation', {
          file: existingFile.title,
        })
      )
    ) {
      return;
    }

    collection.remove(existingFile);
  }

  const placeholder = new Entry({
    fullPath: joinPath(state.getPath(), file.name),
    modified: Date.now(),
    size: file.size,
    mimeType: file.type,
    placeholder: true,
    collection,
  });

  collection.add(placeholder);

  const result = await dav.upload(location.pathname, file);

  if (!result.ok) {
    collection.remove(placeholder);

    state.update();

    return;
  }

  placeholder.placeholder = false;

  state.update();

  success(
    t('successfullyUploaded', {
      interpolation: {
        escapeValue: false,
      },
      file: file.name,
    })
  );
};

export default handleFileUpload;
