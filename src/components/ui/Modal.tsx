import React from 'react';
import PropTypes from 'prop-types';
import {
  Modal as NBModal,
  IModalProps,
  VStack,
  HStack,
  Heading,
  Text,
  IconButton,
  Box,
  ScrollView,
} from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { Button } from './Button';

interface CustomModalProps extends IModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

interface ModalHeaderProps {
  title: string;
  onClose?: () => void;
  rightElement?: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, onClose, rightElement }) => {
  return (
    <HStack justifyContent="space-between" alignItems="center" pb={4} borderBottomWidth={1} borderBottomColor="gray.100">
      <Heading size="md" color="gray.800" flex={1}>
        {title}
      </Heading>
      <HStack alignItems="center" space={2}>
        {rightElement}
        {onClose && (
          <IconButton
            icon={<MaterialIcons name="close" size={20} color="#6B7280" />}
            onPress={onClose}
            variant="ghost"
            size="sm"
            _pressed={{ bg: 'gray.100' }}
          />
        )}
      </HStack>
    </HStack>
  );
};

const ModalBody: React.FC<ModalBodyProps> = ({ children, scrollable = false }) => {
  if (scrollable) {
    return (
      <ScrollView flex={1} showsVerticalScrollIndicator={false} py={4}>
        {children}
      </ScrollView>
    );
  }

  return (
    <Box py={4} flex={1}>
      {children}
    </Box>
  );
};

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => {
  return (
    <Box pt={4} borderTopWidth={1} borderTopColor="gray.100">
      {children}
    </Box>
  );
};

const Modal: React.FC<CustomModalProps> & {
  Header: typeof ModalHeader;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
} = ({ isOpen, onClose, title, size = 'md', children, ...props }) => {
  return (
    <NBModal isOpen={isOpen} onClose={onClose} size={size} {...props}>
      <NBModal.Content
        bg="white"
        borderRadius={16}
        shadow={6}
        maxH="90%"
        mx={4}
      >
        <VStack space={0} flex={1}>
          {title && <ModalHeader title={title} onClose={onClose} />}
          <Box flex={1}>
            {children}
          </Box>
        </VStack>
      </NBModal.Content>
    </NBModal>
  );
};

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', 'full']),
  children: PropTypes.any.isRequired,
};

Modal.defaultProps = {
  size: 'md',
};

export { Modal };

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColorScheme?: string;
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  confirmColorScheme = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <Modal.Header title={title} onClose={onClose} />
      <Modal.Body>
        <Text color="gray.600" fontSize="md" lineHeight={6}>
          {message}
        </Text>
      </Modal.Body>
      <Modal.Footer>
        <HStack space={3} justifyContent="flex-end" width="100%">
          <Button
            title={cancelText}
            variant="outline"
            onPress={onClose}
            isDisabled={isLoading}
            flex={1}
          />
          <Button
            title={confirmText}
            colorScheme={confirmColorScheme}
            onPress={onConfirm}
            isLoading={isLoading}
            flex={1}
          />
        </HStack>
      </Modal.Footer>
    </Modal>
  );
};