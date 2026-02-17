import { Button, ProgressBar } from '@cloudscape-design/components';
import { Auth, Storage } from 'aws-amplify';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useStore } from '../../../store/store';

import awsconfig from '../../../config.json';

// TODO: Update config.json type definition to include Storage.uploadBucket
interface AwsConfigWithStorage {
  Storage?: {
    uploadBucket?: string;
  };
}

/**
 * ModelUpload component for uploading model files to S3
 * Handles file selection, validation, and upload with progress tracking
 */
export function ModelUpload(): JSX.Element {
  const { t } = useTranslation();
  const [sub, setSub] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, dispatch] = useStore();

  useEffect(() => {
    const getData = async () => {
      Auth.currentAuthenticatedUser().then((user: any) => {
        setSub(user.attributes.sub);
        setUsername(user.username);
      });
    };

    getData();

    return () => {
      // Unmounting
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadFiles(e.target.files);
  };

  useEffect(() => {
    const saveModel = async (file: File) => {
      const s3path = `${sub}/${username}/models/${file.name}`;
      //const s3path = `${sub}/${file.name}`;

      if (file.name.match(/^[a-zA-Z0-9-_]+\.tar\.gz$/)) {
        Storage.put(s3path, file, {
          bucket: (awsconfig as any as AwsConfigWithStorage).Storage?.uploadBucket,
          contentType: file.type,
          level: 'private',
          tagging: `lifecycle=true`,
          progressCallback(progress: { loaded: number; total: number }) {
            dispatch('ADD_NOTIFICATION', {
              type: 'info',
              content: (
                <ProgressBar
                  description={t('models.notifications.uploading-model') + ' ' + file.name + '...'}
                  value={Math.round((progress.loaded / progress.total) * 100)}
                  variant="flash"
                />
              ),
              id: file.name,
              dismissible: true,
              onDismiss: () => {
                dispatch('DISMISS_NOTIFICATION', file.name);
              },
            });
          },
        })
          .then((result: any) => {
            console.debug('MODEL UPLOAD RESULT', result);
            dispatch('ADD_NOTIFICATION', {
              type: 'success',
              content: (
                <ProgressBar
                  description={
                    t('models.notifications.upload-successful-1') +
                    ' ' +
                    file.name +
                    ' ' +
                    t('models.notifications.upload-successful-2')
                  }
                  value={100}
                  variant="flash"
                />
              ),
              id: file.name,
              dismissible: true,
              onDismiss: () => {
                dispatch('DISMISS_NOTIFICATION', file.name);
              },
            });
          })
          .catch((err: any) => {
            console.info(err);
            dispatch('ADD_NOTIFICATION', {
              header: t('models.notifications.could-not-upload') + ' ' + file.name,
              type: 'error',
              content: t('common.error'),
              dismissible: true,
              dismissLabel: t('models.notifications.dismiss-message'),
              id: file.name,
              onDismiss: () => {
                dispatch('DISMISS_NOTIFICATION', file.name);
              },
            });
          });
      } else {
        dispatch('ADD_NOTIFICATION', {
          header: t('models.notifications.could-not-upload') + ' ' + file.name,
          type: 'error',
          content: file.name + ' ' + t('carmodelupload.modal.file-regex'),
          dismissible: true,
          dismissLabel: t('models.notifications.dismiss-message'),
          id: file.name,
          onDismiss: () => {
            dispatch('DISMISS_NOTIFICATION', file.name);
          },
        });
      }
    };

    for (let index = 0; index < (uploadFiles?.length || 0); index++) {
      if (uploadFiles) {
        saveModel(uploadFiles[index]);
      }
    }

    return () => {
      // Unmounting
    };
  }, [uploadFiles]);

  return (
    <>
      <Button
        iconName="upload"
        onClick={() => {
          setUploadFiles(null);
          fileInputRef.current?.click();
        }}
      >
        {t('upload.chose-file')}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="application/gzip,application/tar"
          multiple
          hidden
        />
      </Button>
    </>
  );
}
