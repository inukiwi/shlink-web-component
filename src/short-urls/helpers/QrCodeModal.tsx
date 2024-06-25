import { faFileDownload as downloadIcon } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMemo, useState } from 'react';
import { ExternalLink } from 'react-external-link';
import { Button, FormGroup, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';
import type { FCWithDeps } from '../../container/utils';
import { componentFactory, useDependencies } from '../../container/utils';
import { CopyToClipboardIcon } from '../../utils/components/CopyToClipboardIcon';
import type { QrCodeFormat, QrErrorCorrection } from '../../utils/helpers/qrCodes';
import { buildQrCodeUrl } from '../../utils/helpers/qrCodes';
import type { ImageDownloader } from '../../utils/services/ImageDownloader';
import type { ShortUrlModalProps } from '../data';
import { QrErrorCorrectionDropdown } from './qr-codes/QrErrorCorrectionDropdown';
import { QrFormatDropdown } from './qr-codes/QrFormatDropdown';
import './QrCodeModal.scss';

type QrCodeModalDeps = {
  ImageDownloader: ImageDownloader
};

const QrCodeModal: FCWithDeps<ShortUrlModalProps, QrCodeModalDeps> = (
  { shortUrl: { shortUrl, shortCode }, toggle, isOpen },
) => {
  const { ImageDownloader: imageDownloader } = useDependencies(QrCodeModal);
  const [size, setSize] = useState<number|undefined>();
  const [margin, setMargin] = useState<number|undefined>();
  const [format, setFormat] = useState<QrCodeFormat|undefined>();
  const [errorCorrection, setErrorCorrection] = useState<QrErrorCorrection|undefined>();
  const qrCodeUrl = useMemo(
    () => buildQrCodeUrl(shortUrl, { size, format, margin, errorCorrection }),
    [shortUrl, size, format, margin, errorCorrection],
  );
  const totalSize = useMemo(() => size + margin, [size, margin]);
  const modalSize = useMemo(() => {
    if (totalSize < 500) {
      return undefined;
    }

    return totalSize < 800 ? 'lg' : 'xl';
  }, [totalSize]);

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size={modalSize}>
      <ModalHeader toggle={toggle}>
        QR code for <ExternalLink href={shortUrl}>{shortUrl}</ExternalLink>
      </ModalHeader>
      <ModalBody>
        <Row>
          <FormGroup className="d-grid col-md-6">
            <label htmlFor="sizeControl">Size: {size}px</label>
            <input
              id="sizeControl"
              type="range"
              className="form-control-range"
              value={size}
              step={10}
              min={50}
              max={1000}
              onChange={(e) => setSize(Number(e.target.value))}
            />
          </FormGroup>
          <FormGroup className="d-grid col-md-6">
            <label htmlFor="marginControl">Margin: {margin}px</label>
            <input
              id="marginControl"
              type="range"
              className="form-control-range"
              value={margin}
              step={1}
              min={0}
              max={100}
              onChange={(e) => setMargin(Number(e.target.value))}
            />
          </FormGroup>
          <FormGroup className="d-grid col-md-6">
            <QrFormatDropdown format={format} setFormat={setFormat} />
          </FormGroup>
          <FormGroup className="col-md-6">
            <QrErrorCorrectionDropdown errorCorrection={errorCorrection} setErrorCorrection={setErrorCorrection} />
          </FormGroup>
        </Row>
        <div className="text-center">
          <div className="mb-3">
            <ExternalLink href={qrCodeUrl} />
            <CopyToClipboardIcon text={qrCodeUrl} />
          </div>
          <img src={qrCodeUrl} className="qr-code-modal__img" alt="QR code" />
          <div className="mt-3">
            <Button
              block
              color="primary"
              onClick={() => {
                imageDownloader.saveImage(qrCodeUrl, `${shortCode}-qr-code.${format}`).catch(() => {});
              }}
            >
              Download <FontAwesomeIcon icon={downloadIcon} className="ms-1" />
            </Button>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export const QrCodeModalFactory = componentFactory(QrCodeModal, ['ImageDownloader']);
