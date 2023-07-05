/* eslint-disable react/prop-types */
import { useState, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box, Button, Input, Link, useToast } from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import * as Yup from 'yup';
import { Form, Formik } from 'formik';
import bc from '../../common/services/breathecode';
import useSignup from '../../common/store/actions/signupAction';
import Heading from '../../common/components/Heading';
import Icon from '../../common/components/Icon';
import useStyle from '../../common/hooks/useStyle';
import Text from '../../common/components/Text';
import FieldForm from '../../common/components/Forms/FieldForm';
import { formatPrice, number2DIgits } from '../../utils';
import DatePickerField from '../../common/components/Forms/DateField';
import ModalInfo from '../moduleMap/modalInfo';
import { usePersistent } from '../../common/hooks/usePersistent';

const CustomDateInput = forwardRef(({ value, onClick, ...rest }, ref) => {
  const { t } = useTranslation('signup');
  const { input } = useStyle();
  const inputBorderColor = input.borderColor;

  return (
    <Input
      {...rest}
      placeholder={t('expiration-date')}
      onClick={onClick}
      height="50px"
      borderRadius="3px"
      borderColor={inputBorderColor}
      ref={ref}
      value={value}
    />
  );
});

const ServiceSummary = ({ service }) => {
  const { t } = useTranslation('signup');
  const {
    state, setSelectedService, setPaymentInfo,
  } = useSignup();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false);
  const [cohortSession] = usePersistent('cohortSession', {});
  const { selectedService, paymentInfo } = state;
  const { backgroundColor, lightColor, hexColor, backgroundColor3 } = useStyle();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stateCard, setStateCard] = useState({
    card_number: 0,
    exp_month: 0,
    exp_year: 0,
    cvc: 0,
  });

  const toast = useToast();

  const infoValidation = Yup.object().shape({
    owner_name: Yup.string()
      .min(6, t('validators.owner_name-min'))
      .required(t('validators.owner_name-required')),
    card_number: Yup.string()
      .min(16)
      .max(20)
      .required(t('validators.card_number-required')),
    exp: Yup.string()
      .min(4)
      .required(t('validators.exp-required')),
    cvc: Yup.string()
      .min(3)
      .max(3)
      .required(t('validators.cvc-required')),
  });

  const dataToAssign = {
    service: service?.id,
    academy: service?.academy?.id,
    how_many: selectedService?.qty,
    mentorship_service_set: service.serviceInfo.type === 'mentorship' ? service.serviceInfo.id : undefined,
    event_type_set: service.serviceInfo.type === 'event' ? service.serviceInfo.id : undefined,
  };

  const handlePayConsumable = () => {
    bc.payment().service().payConsumable(dataToAssign)
      .then((res) => {
        if (res && res?.status < 400) {
          setPurchaseCompleted(true);
          setConfirmationOpen(false);
        }
      })
      .catch(() => {});
  };
  const handleSubmit = (actions, values) => {
    bc.payment().addCard(values)
      .then((resp) => {
        if (resp) {
          setConfirmationOpen(true);
        }
        if (resp?.status >= 400) {
          toast({
            position: 'top',
            title: t('alert-message:card-error'),
            description: t('alert-message:card-error-description'),
            status: 'error',
            duration: 7000,
            isClosable: true,
          });
        }
      })
      .catch(() => {
        toast({
          position: 'top',
          title: t('alert-message:card-error'),
          description: t('alert-message:card-error-description'),
          status: 'error',
          duration: 7000,
          isClosable: true,
        });
      });
  };

  return (
    <Box
      display="flex"
      flexDirection={{ base: 'column', md: 'row' }}
      gridGap="30px"
      justifyContent="center"
      mb="1rem"
    >
      {purchaseCompleted
        ? (
          <Box display="flex" justifyContent="center" flexDirection="column" gridGap="24px">
            <Box display="flex" flexDirection="column" gridGap="12px" alignItems="center" padding="14px 23px" background={backgroundColor} borderRadius="15px">
              <Avatar src="https://breathecode.herokuapp.com/static/img/avatar-8.png" border="3px solid #25BF6C" width="91px" height="91px" borderRadius="50px" />
              <Box fontSize="26px" fontWeight={700} width={{ base: 'auto', md: '75%' }} textAlign="center">
                {t('consumables.purchase-completed-title')}
              </Box>
            </Box>

            <Box display="flex" justifyContent="space-between" gridGap="10px" padding="14px 10%" background={backgroundColor} borderRadius="15px">
              <Box display="flex" flexDirection="column" gridGap="12px">
                <Box color="yellow.default" fontSize="16px" textTransform="uppercase" fontWeight={900}>
                  {t('consumables.you-have-received')}
                </Box>
                <Box display="flex" gridGap="12px">
                  <Box>
                    <Box background="yellow.default" minWidth="50px" borderRadius="50px" width="fit-content" padding="10px">
                      <Icon icon="idea" width="40px" height="40px" />
                    </Box>
                  </Box>
                  <Box fontSize="21px" fontWeight={700}>
                    {t(`${service.serviceInfo.type}-bundle-title`)}
                  </Box>
                </Box>
              </Box>
              <Box display="flex" flexDirection="column" justifyContent="center" gridGap="0px" fontWeight={700} lineHeight="32px" background="blue.default" alignItems="center" padding="10px 15px" borderRadius="11px" color="white">
                <Box fontSize="38px">{selectedService?.qty}</Box>
                <Box fontSize="28px">
                  {service.serviceInfo.type === 'mentorship' ? 'sessions' : 'events'}
                </Box>
              </Box>
            </Box>
            <Box display="flex" gridGap="12px" margin="2rem auto 0 auto" alignItems="center">
              <Link variant="default" href={cohortSession?.selectedProgramSlug || ''}>
                {t('consumables.back-to-dashboard')}
              </Link>
              <Icon icon="longArrowRight" width="24px" height="10px" color={hexColor.blueDefault} />
            </Box>
          </Box>
        )
        : (
          <>
            <Box display="flex" flexDirection="column" flex={0.5} gridGap="24px">
              <Box display="flex" flexDirection="column" gridGap="3rem" background={backgroundColor} p={{ base: '20px 22px', md: '14px 23px' }} height="100%" borderRadius="15px">
                <Box
                  display="flex"
                  flexDirection="column"
                  w="100%"
                  height="fit-content"
                  p="11px 14px"
                  gridGap="8px"
                  borderRadius="14px"
                >
                  <Heading size="16px" fontWeight={900} color="yellow.default" textTransform="uppercase">
                    {t('getting-for')}
                  </Heading>
                  <Box display="flex" gridGap="12px" alignItems="center">
                    <Box display="flex" flexDirection="column">
                      <Box
                        background="yellow.default"
                        borderRadius="50px"
                        width="fit-content"
                        padding="10px"
                      >
                        <Icon icon="idea" width="40px" height="40px" color="#fff" />
                      </Box>
                    </Box>
                    <Box display="flex" flexDirection="column" gridGap="7px">
                      <Heading size="21px" width="70%">
                        {t(`${service.serviceInfo.type}-bundle-title`)}
                      </Heading>
                    </Box>
                  </Box>
                </Box>
              </Box>
              {service?.list?.length > 0 && (
                <Box display="flex" flexDirection="column" gridGap="10px" padding="14px 23px" background={backgroundColor} borderRadius="15px">
                  <Box height="40px" display="flex" flexDirection={{ base: 'column', sm: 'row' }} margin={{ base: '0 0 30px 0', sm: '0' }} justifyContent="space-between" alignItems="center">
                    <Heading as="span" size="21px">
                      {t('consumables.select-bundle')}
                    </Heading>
                    {selectedService?.id && (
                      <Button fontSize="14px" variant="link" onClick={() => setSelectedService({})}>
                        {t('consumables.change-my-selection')}
                      </Button>
                    )}
                  </Box>
                  {!selectedService?.id
                    ? service.list.map((item) => {
                      const isSelected = item?.id === selectedService?.id;
                      return (
                        <Box
                          key={`${item?.slug}-${item?.title}`}
                          display="flex"
                          onClick={() => {
                            setSelectedService(item);
                          }}
                          flexDirection="row"
                          width="100%"
                          justifyContent="space-between"
                          p={{ base: '14px', sm: '22px 18px' }}
                          gridGap={{ base: '12px', md: '20px' }}
                          cursor="pointer"
                          border={isSelected ? '2px solid #0097CD' : `2px solid ${hexColor.featuredColor}`}
                          borderRadius="13px"
                          alignItems="center"
                        >
                          <Box
                            display="flex"
                            flexDirection="column"
                            gridGap={{ base: '0', md: '4px' }}
                            // minWidth={{ base: 'auto', md: '228px' }}
                            height="fit-content"
                            fontWeight="400"
                          >
                            <Box fontSize={{ base: '16px', md: '18px' }} fontWeight="700">
                              {item?.title}
                            </Box>
                            <Text fontSize="14px" color={isSelected ? 'blue.default' : lightColor} fontWeight={isSelected ? 700 : 400}>
                              {`${formatPrice(item.pricePerUnit, true)} per session`}
                            </Text>
                          </Box>
                          <Box position="relative" display="flex" alignItems="center" height="fit-content" gridGap="10px">
                            <Heading
                              as="span"
                              size={{ base: '20px', md: '30px' }}
                              lineHeight="1"
                              color="blue.default"
                              width="auto"
                              textAlign="end"
                            >
                              {item?.priceText}
                            </Heading>
                            <Heading
                              as="span"
                              position="absolute"
                              bottom="-18px"
                              right="0px"
                              size="16px"
                              lineHeight="1"
                              color="#999"
                              textDecorationLine="line-through"
                              // text-decoration-line
                              width="auto"
                              textAlign="end"
                            >
                              {`${formatPrice(item?.price, true)}`}
                            </Heading>
                          </Box>
                        </Box>
                      );
                    }) : (
                      <Box
                        display="flex"
                        flexDirection="row"
                        width="100%"
                        justifyContent="space-between"
                        // p={selectedIndex === i ? '22px 18px' : '26px 22px'}
                        p={{ base: '14px', sm: '22px 18px' }}
                        gridGap={{ base: '12px', md: '20px' }}
                        cursor="pointer"
                        // background={selectedIndex !== i && featuredColor}
                        border="2px solid #0097CD"
                        alignItems="center"
                        borderRadius="13px"
                      >
                        <Box
                          display="flex"
                          flexDirection="column"
                          gridGap={{ base: '0', md: '4px' }}
                          // minWidth={{ base: 'auto', md: '228px' }}
                          height="fit-content"
                          fontWeight="400"
                        >
                          <Box fontSize="18px" fontWeight="700">
                            {selectedService?.title}
                          </Box>
                          <Text fontSize="14px" color="blue.default" fontWeight={700}>
                            {`${formatPrice(selectedService.pricePerUnit, true)} per session`}
                          </Text>
                        </Box>
                        <Box position="relative" display="flex" height="fit-content" alignItems="center" gridGap="10px">
                          <Heading
                            as="span"
                            size={{ base: '20px', md: '30px' }}
                            lineHeight="1"
                            color="blue.default"
                            width="auto"
                            textAlign="end"
                          >
                            {selectedService?.priceText}
                          </Heading>
                          <Heading
                            as="span"
                            position="absolute"
                            bottom="-18px"
                            right="0px"
                            size="16px"
                            lineHeight="1"
                            color="#999"
                            textDecorationLine="line-through"
                            // text-decoration-line
                            width="auto"
                            textAlign="end"
                          >
                            {`${formatPrice(selectedService?.price, true)}`}
                          </Heading>
                        </Box>
                      </Box>
                    )}
                </Box>
              )}
            </Box>
            <Box display="flex" flexDirection="column" flex={0.5}>
              <Box background={backgroundColor} p={{ base: '22px', md: '14px 23px' }} borderRadius="15px">
                <Heading
                  size="xsm"
                  p="0 0 12px 0"
                >
                  {t('select-payment-plan')}
                </Heading>
                <Box display="flex" flexDirection="column" gridGap="10px">
                  <Formik
                    initialValues={{
                      owner_name: '',
                      card_number: '',
                      exp: '',
                      cvc: '',
                    }}
                    onSubmit={(values, actions) => {
                      setIsSubmitting(true);
                      const expMonth = number2DIgits(values.exp?.getMonth() + 1);
                      const expYear = number2DIgits(values.exp?.getFullYear() - 2000);

                      const allValues = {
                        card_number: stateCard.card_number,
                        exp_month: expMonth,
                        exp_year: expYear,
                        cvc: values.cvc,
                      };
                      handleSubmit(actions, allValues);
                    }}
                    validationSchema={infoValidation}
                  >
                    {() => (
                      <Form
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gridGap: '22px',
                        }}
                      >
                        <Box display="flex" gridGap="18px">
                          <FieldForm
                            type="text"
                            name="owner_name"
                            externValue={paymentInfo.owner_name}
                            handleOnChange={(e) => {
                              setPaymentInfo('owner_name', e.target.value);
                              setStateCard({ ...stateCard, owner_name: e.target.value });
                            }}
                            pattern="[A-Za-z ]*"
                            label={t('owner-name')}
                          />
                        </Box>
                        <Box display="flex" gridGap="18px">
                          <FieldForm
                            type="text"
                            name="card_number"
                            externValue={paymentInfo.card_number}
                            handleOnChange={(e) => {
                              const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                              const newValue = value.replace(/(.{4})/g, '$1 ').trim();
                              e.target.value = newValue.slice(0, 19);
                              setPaymentInfo('card_number', e.target.value);
                              setStateCard({ ...stateCard, card_number: newValue.replaceAll(' ', '').slice(0, 16) });
                            }}
                            pattern="[0-9]*"
                            label={t('card-number')}
                          />
                        </Box>
                        <Box display="flex" gridGap="18px">
                          <Box display="flex" gridGap="18px" flex={1}>
                            <Box display="flex" flexDirection="column" flex={0.5}>
                              <DatePickerField
                                type="text"
                                name="exp"
                                wrapperClassName="datePicker"
                                onChange={(date) => {
                                  setPaymentInfo('exp', date);
                                }}
                                customInput={<CustomDateInput />}
                                dateFormat="MM/yy"
                                showMonthYearPicker
                              />
                            </Box>
                            <FieldForm
                              style={{ flex: 0.5 }}
                              type="text"
                              name="cvc"
                              externValue={paymentInfo.cvc}
                              maxLength={3}
                              handleOnChange={(e) => {
                                const value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
                                const newValue = value.replace(/(.{3})/g, '$1 ').trim();
                                e.target.value = newValue.slice(0, 3);

                                setPaymentInfo('cvc', e.target.value);
                              }}
                              pattern="[0-9]*"
                              label={t('cvc')}
                            />
                          </Box>
                        </Box>

                        <Button
                          type="submit"
                          width="100%"
                          variant="default"
                          disabled={!selectedService?.id}
                          isLoading={isSubmitting}
                          height="40px"
                          mt="0"
                        >
                          {t('common:proceed-to-payment')}
                        </Button>
                      </Form>
                    )}
                  </Formik>
                </Box>
              </Box>
            </Box>
            <ModalInfo
              isOpen={confirmationOpen}
              headerStyles={{
                fontSize: '16px',
                textAlign: 'center',
                fontWeight: 900,
                textTransform: 'uppercase',
              }}
              maxWidth="lg"
              // footerStyle={{ flexDirection: 'row-reverse' }}
              title="Confirm purchase"
              childrenDescription={(
                <Box display="flex" flexDirection="column" gridGap="24px">
                  <Box margin="16px auto 0 auto" fontSize="18px" fontWeight={700}>
                    {t('consumables.confirm-purchase-connector')}
                  </Box>

                  <Box display="flex" justifyContent="space-between" gridGap="10px">
                    <Box display="flex" gridGap="12px">
                      <Box>
                        <Box background="yellow.default" minWidth="50px" borderRadius="50px" width="fit-content" padding="10px">
                          <Icon icon="idea" width="40px" height="40px" />
                        </Box>
                      </Box>
                      <Box fontSize="21px" fontWeight={700}>
                        {t(`${service.serviceInfo.type}-bundle-title`)}
                      </Box>
                    </Box>
                    <Box display="flex" flexDirection="column" borderRadius="11px" gridGap="0px" fontWeight={700} lineHeight="32px" background={backgroundColor3} alignItems="center" padding="10px 15px">
                      <Box fontSize="38px">{selectedService?.qty}</Box>
                      <Box fontSize="28px">
                        {service.serviceInfo.type === 'mentorship' ? 'sessions' : 'events'}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )}
              buttonHandlerStyles={{ variant: 'default' }}
              handlerText="Confirm"
              actionHandler={() => handlePayConsumable()}
              onClose={() => {
                setIsSubmitting(false);
                setConfirmationOpen(false);
              }}
              closeButtonStyles={{ borderRadius: '3px', color: '#0097CD', borderColor: '#0097CD' }}
              closeButtonVariant="outline"
            />
          </>
        )}
    </Box>
  );
};

ServiceSummary.propTypes = {
  service: PropTypes.objectOf(PropTypes.any),
};
ServiceSummary.defaultProps = {
  service: {},
};
export default ServiceSummary;
