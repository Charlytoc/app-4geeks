/* eslint-disable max-len */
import {
  Badge,  Box, Button, FormLabel, Input, Link, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, Textarea, useToast, useColorModeValue, useDisclosure,
} from '@chakra-ui/react';
import { WarningTwoIcon } from "@chakra-ui/icons";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { ChatIcon } from "@chakra-ui/icons";
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
// import { Formik, Form, Field } from 'formik';
import PropTypes from 'prop-types';
import {
  memo, useEffect, useState, useRef, Fragment,
} from 'react';
import bc from '../../common/services/breathecode';
// import { getStorageItem } from '../../utils';
// import Modal from './modal';

const DeliverModal = ({
  currentTask, projectLink, updpateAssignment,
}) => {
  const { t } = useTranslation('assignments');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isLoading, setIsLoading] = useState(false);
  const [openIgnoreTask, setOpenIgnoreTask] = useState(false);
  const [deliveryUrl, setDeliveryUrl] = useState('');
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const textAreaRef = useRef(null);
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const fontColor = useColorModeValue('gra.dark', 'gray.250');
  const labelColor = useColorModeValue('gray.600', 'gray.200');
  const commonBorderColor = useColorModeValue('gray.250', 'gray.500');
  const router = useRouter();
  const { academy } = router.query;
  const taskIsIgnored = currentTask?.revision_status === 'IGNORED';

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  return (
    <Box width="auto" height="auto">
      <Button
        variant="outline"
        isLoading={isLoading}
        onClick={() => {
          setIsLoading(true);
          bc.todo().deliver({
            id: currentTask.id,
            academy,
          })
            .then(({ data }) => {
              setDeliveryUrl(data.delivery_url);
              onOpen();
              setIsLoading(false);
            })
            .catch(() => {
              toast({
                title: t('alert-message:review-url-error'),
                status: 'error',
                duration: 6000,
                isClosable: true,
              });
            });
        }}
        fontSize="15px"
        padding="0 24px"
      >
       
        {t('task-handler.deliver')}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent borderRadius="17px" marginTop="10%">
          <ModalHeader fontSize="15px" color={labelColor} textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
            {t('deliver-assignment.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={4} px={{ base: '10px', md: '35px' }}>
            <Box display="flex" flexDirection="column" pb={6}>
              <Text color={fontColor}>{fullName}</Text>
              <Link href={projectLink} fontWeight="700" letterSpacing="0.05em" width="fit-content" target="_blank" rel="noopener noreferrer" color="blue.default">
                {currentTask.title}
              </Link>
            </Box>
            <FormLabel fontSize="12px" letterSpacing="0.05em" color={labelColor}>
              {t('deliver-assignment.label')}
            </FormLabel>
            <Box display="flex" flexDirection="row">
              <Input
                ref={textAreaRef}
                onClick={() => {
                  textAreaRef.current.select();
                  navigator.clipboard.writeText(deliveryUrl);
                  setCopied(true);
                }}
                type="text"
                background={useColorModeValue('gray.250', 'featuredDark')}
                value={deliveryUrl}
                readOnly
                borderTopRightRadius="0"
                borderBottomRightRadius="0"
              />
              <Button
                variant="default"
                minWidth="auto"
                background={copied ? 'success' : 'blue.default'}
                _hover={{
                  background: copied ? 'success' : 'blue.default',
                }}
                onClick={() => {
                  if (copied === false) {
                    navigator.clipboard.writeText(deliveryUrl);
                    setCopied(true);
                  }
                }}
                borderTopLeftRadius="0"
                borderBottomLeftRadius="0"
                textTransform="uppercase"
                fontSize="13px"
                fontWeight="700"
                p="12px 16px"
              >
                {copied ? t('deliver-assignment.copied') : t('deliver-assignment.copy')}
              </Button>
            </Box>
            <Text fontSize="12px" letterSpacing="0.05em" pt="8px" color={labelColor}>
              {t('deliver-assignment.hint')}
            </Text>
          </ModalBody>
          <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={commonBorderColor}>
            <Button onClick={() => setOpenIgnoreTask(true)} variant={taskIsIgnored ? 'default' : 'outline'} textTransform="uppercase">
              {taskIsIgnored
                ? t('deliver-assignment.mark-as-pending')
                : t('deliver-assignment.ignore-task')}
            </Button>
          </ModalFooter>
        </ModalContent>

        <Modal
          // isCentered
          isOpen={openIgnoreTask}
          onClose={() => setOpenIgnoreTask(false)}
          size="lg"
        >
          <ModalOverlay />
          <ModalContent borderRadius="17px" marginTop="10%">
            <ModalHeader fontSize="15px" color="gray.600" textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
              {t('deliver-assignment.title')}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pt="2rem" pb="2rem" px={{ base: '20px', md: '15%' }}>
              <Text fontSize="22px" fontWeight="700" textAlign="center">
                {`Are you sure you want to ignore this task for ${fullName}?`}
              </Text>
            </ModalBody>
            <ModalFooter margin="0 1.5rem" padding="1.5rem 0" justifyContent="center" borderTop="1px solid" borderColor={commonBorderColor}>
              <Button
                onClick={() => {
                  bc.todo().update({
                    id: currentTask.id,
                    revision_status: taskIsIgnored ? 'PENDING' : 'IGNORED',
                  })
                    .then(() => {
                      toast({
                        title: t('alert-message:review-assignment-ignored-task'),
                        status: 'success',
                        duration: 5000,
                        isClosable: true,
                      });
                      updpateAssignment({
                        ...currentTask,
                        id: currentTask.id,
                        revision_status: taskIsIgnored ? 'PENDING' : 'IGNORED',
                      });
                      setOpenIgnoreTask(false);
                      onClose();
                    })
                    .catch(() => {
                      toast({
                        title: t('alert-message:review-assignment-error'),
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                      });
                    });
                }}
                variant={taskIsIgnored ? 'default' : 'outline'}
                textTransform="uppercase"
              >
                {taskIsIgnored
                  ? t('deliver-assignment.mark-as-pending')
                  : t('deliver-assignment.ignore-task')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Modal>

    </Box>
  );
};

const ReviewModal = ({ currentTask, projectLink, updpateAssignment }) => {
  const { t } = useTranslation('assignments');
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [comment, setComment] = useState('');
  const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;
  const commonBorderColor = useColorModeValue('gray.250', 'gray.500');
  const [numberOfReviews, setNumberOfReviews] = useState(0);
  const rigobotURL = 'https://8000-charlytoc-rigobot-91hkkq2c2ql.ws-us97.gitpod.io'

  const fetchNumberOfReviews = async () => {
    try {
      // const response = await fetch(`${rigobotURL}/v1/finetuning/get/revisions?repo=${projectLink}`);

      const response = await fetch(`${rigobotURL}/v1/finetuning/get/revisions?repo=${projectLink}`);
      const data = await response.json();
      setNumberOfReviews(data.length);
      console.log(data.length)
    } catch (error) {
      console.error(error);
    }
  };

  // useEffect(() => {
  //   fetchNumberOfReviews();
  // }, []);


  const ReviewButton = ({ type }) => {
    const statusColor = {
      approve: 'success',
      reject: 'error',
    };
    const buttonColor = {
      approve: 'success',
      reject: 'danger',
    };
    const buttonText = {
      approve: t('review-assignment.approve'),
      reject: t('review-assignment.reject'),
    };
    const revisionStatus = {
      approve: 'APPROVED',
      reject: 'REJECTED',
    };
    const alertStatus = {
      approve: t('alert-message:review-assignment-approve'),
      reject: t('alert-message:review-assignment-reject'),
    };

    return (
      <Button
        background={buttonColor[type]}
        _hover={{ background: buttonColor[type] }}
        onClick={() => {
          if (revisionStatus[type] !== undefined) {
            bc.todo().update({
              id: currentTask.id,
              revision_status: revisionStatus[type],
              description: comment,
            })
              .then(() => {
                toast({
                  title: alertStatus[type],
                  status: statusColor[type],
                  duration: 5000,
                  isClosable: true,
                });
                updpateAssignment({
                  ...currentTask,
                  id: currentTask.id,
                  revision_status: revisionStatus[type],
                  description: comment,
                });
                onClose();
              })
              .catch(() => {
                toast({
                  title: t('alert-message:review-assignment-error'),
                  status: 'error',
                  duration: 5000,
                  isClosable: true,
                });
              });
          }
        }}
        color="white"
        fontSize="13px"
        textTransform="uppercase"
      >
        {buttonText[type]}
      </Button>
    );
  };

  ReviewButton.propTypes = {
    type: PropTypes.string.isRequired,
  };

  return (
    <Box width="auto" height="auto">
      <Button
        variant="default"
        onClick={onOpen}
        fontSize="15px"
        padding="0 24px"
      > 
        {t('task-handler.review')}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent borderRadius="17px" marginTop="10%">
          <ModalHeader fontSize="15px" color="gray.600" textAlign="center" letterSpacing="0.05em" borderBottom="1px solid" borderColor={commonBorderColor} fontWeight="bold" textTransform="uppercase">
            {t('review-assignment.title')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6} px={{ base: '10px', md: '35px' }}>
          {
          numberOfReviews >= 3 
          ? 
          <Box display="flex" alignItems='start' flexDirection={'column'} pt={4} pb={4} bg="#EEF9FE" p={3} borderRadius="md" fontSize="sm" fontWeight={"700"}>
            {t('This project already has 3 code reviews; you can continue reviewing the code or approve/reject the entire project.')}
            <Link href={projectLink} fontWeight="700" width="fit-content" letterSpacing="0.05em" target="_blank" rel="noopener noreferrer" color="blue.default">
              {t('Learn more about code reviews at 4Geeks.')}
            </Link>
          </Box>
          :
          <Box display="flex" alignItems='center' pt={4} pb={5} bg="#FFB718" p={3} borderRadius="md" fontSize="sm" fontWeight={"700"}>
            <WarningTwoIcon mr={2} color="yellow.800" />
            {t('This project needs to have at least 3 code reviews in order to be accepted or rejected')}
          </Box> 
        }
            <Box display="flex" flexDirection="column" pt={4} pb={5}>
              <Text>{fullName}</Text>
              <Link href={projectLink} fontWeight="700" width="fit-content" letterSpacing="0.05em" target="_blank" rel="noopener noreferrer" color="blue.default">
                {currentTask.title}
              </Link>
            </Box>

            <Box display="flex" flexDirection="column" pt={4} pb={5} bg="#EEF9FE" >
              <Text>
              <ChatIcon mr={2} boxSize={6} color="gray.300" />
                {numberOfReviews} code reviews</Text>
              <Link href={`${rigobotURL}/review/repo?repo=${projectLink}`} fontWeight="700" width="fit-content" letterSpacing="0.05em" target="_blank" rel="noopener noreferrer" color="blue.default">
                {t('Start code review ')}
                <ChevronRightIcon ml={2} color="#0097CF" boxSize={4} />
              </Link>
            </Box>
            {numberOfReviews >= 3 && <>
              <Textarea onChange={(e) => setComment(e.target.value)} placeholder={t('review-assignment.comment-placeholder'+'partimos 1.sd')} fontSize="14px" height="128px" />
            <Box pt={6} display="flex" flexDirection="row" justifyContent="space-between">
              {['reject', 'approve'].map((type) => (
                <Fragment key={type}>
                  <ReviewButton type={type} />
                </Fragment>
              ))}
            </Box>
            </>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

const ButtonHandler = ({
  currentTask, cohortSession, contextState, setContextState,
}) => {
  const { t } = useTranslation('assignments');
  const router = useRouter();
  const toast = useToast();
  const lang = {
    es: '/es/',
    en: '/',
  };
  const projectLink = `https://4geeks.com${lang[router.locale]}project/${currentTask.associated_slug}`;

  const updpateAssignment = async (taskUpdated) => {
    const keyIndex = contextState.allTasks.findIndex((x) => x.id === taskUpdated.id);
    await setContextState({
      allTasks: [
        ...contextState.allTasks.slice(0, keyIndex), // before keyIndex (inclusive)
        taskUpdated, // key item (updated)
        ...contextState.allTasks.slice(keyIndex + 1), // after keyIndex (exclusive)
      ],
    });
  };
  console.log(currentTask, "this is current tasks")
  // const fullName = `${currentTask?.user?.first_name} ${currentTask?.user?.last_name}`;

  if (currentTask && currentTask.task_type) {
    const taskStatus = currentTask.task_status;
    const revisionStatus = currentTask.revision_status;

    const statusConditional = {
      delivered: taskStatus === 'DONE' && revisionStatus === 'PENDING',
      approved: revisionStatus === 'APPROVED',
      rejected: revisionStatus === 'REJECTED',
      undelivered: taskStatus === 'PENDING' && revisionStatus === 'PENDING',
    };

    if (statusConditional.delivered) {
      return (
        <ReviewModal currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
      );
    }
    if (statusConditional.approved) {
      return (
        <Box width="auto" height="auto">
          <Button
            variant="link"
            onClick={() => {
              bc.todo().update({
                id: currentTask.id,
                revision_status: 'PENDING',
              })
                .then(() => {
                  updpateAssignment({
                    ...currentTask,
                    id: currentTask.id,
                    revision_status: 'PENDING',
                  });
                  toast({
                    title: t('alert-message:review-assignment-updated'),
                    status: 'success',
                    duration: 5000,
                    isClosable: true,
                  });
                })
                .catch(() => {
                  toast({
                    title: t('alert-message:review-assignment-error'),
                    status: 'error',
                    duration: 5000,
                    isClosable: true,
                  });
                });
            }}
            fontSize="15px"
            color="blue.default"
            _hover={{ textDecoration: 'none' }}
          >
            {t('task-handler.undo-approval')}
          </Button>
        </Box>
      );
    }
    if (statusConditional.rejected) {
      return (
        <Box width="auto" height="auto">
          <DeliverModal currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
        </Box>
      );
    }
  }
  return (
    <Box width="auto" height="auto">
      <DeliverModal currentTask={currentTask} projectLink={projectLink} cohortSession={cohortSession} updpateAssignment={updpateAssignment} />
    </Box>
  );
};

ButtonHandler.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any),
  cohortSession: PropTypes.objectOf(PropTypes.any),
  contextState: PropTypes.objectOf(PropTypes.any).isRequired,
  setContextState: PropTypes.func.isRequired,
};
ButtonHandler.defaultProps = {
  currentTask: null,
  cohortSession: null,
};
DeliverModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
};
ReviewModal.propTypes = {
  currentTask: PropTypes.objectOf(PropTypes.any).isRequired,
  projectLink: PropTypes.string.isRequired,
  updpateAssignment: PropTypes.func.isRequired,
};

export default memo(ButtonHandler);
