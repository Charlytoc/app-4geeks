import {
  Box, HStack, Link, PinInput, PinInputField,
} from '@chakra-ui/react';
import useTranslation from 'next-translate/useTranslation';
import { useCookies } from 'react-cookie';
import Heading from '../common/components/Heading';
import Text from '../common/components/Text';
import Icon from '../common/components/Icon';

const ThankYou = () => {
  const { t } = useTranslation('thank-you');
  const [cookies] = useCookies(['subscriptionId']);

  const social = t('share-social', {}, { returnObjects: true });
  return (
    <Box display="flex" justifyContent="center" background="linear-gradient(180deg, #EEF9FE 50%, white 50%)" width="100%" height="90vh" textAlign="center">
      <Box borderRadius="20px" p={{ base: '70px 6%', md: '70px 0 0 0' }} m={{ base: 'auto 10px', md: '80px 0 0 0' }} backgroundColor="white" minWidth={{ base: 'auto', md: '700px' }} minHeight={{ base: 'auto', md: '500px' }}>
        <Heading as="h1" size="xl" color="blue.default">
          {t('title')}
        </Heading>
        <Text fontSize="25px" p="10px 0" fontWeight="500">
          {t('you-are-in-waiting-list')}
        </Text>
        <HStack justifyContent="center" p="30px 0 20px 0">
          <PinInput defaultValue="12345" value={cookies.subscriptionId} size="lg" isDisabled placeholder="0">
            {Array(cookies.subscriptionId?.length).fill(0).map((_, i) => {
              const index = i;
              return (
                <PinInputField
                  key={index}
                  style={{
                    cursor: 'default',
                    width: 'clamp(2.5rem, 1.74rem + 7.99vw, 6.563rem)',
                    height: 'clamp(3.75rem, 1.74rem + 7.99vw, 7.5rem)',
                    fontSize: 'clamp(2.1875rem, 1.74rem + 1.99vw, 3.125rem)',
                    opacity: 1,
                    fontWeight: '700',
                    backgroundColor: '#F5F5F5',
                    border: '0',
                  }}
                />
              );
            })}
          </PinInput>
        </HStack>
        <Text fontSize="20px" p="10px 0" color="gray.600" fontWeight="600">
          {t('get-ready-to-learn')}
        </Text>
        <Text fontSize="16px" p="10px 0" margin="0 auto" textAlign="center" color="gray.600" fontWeight="500">
          {t('share-on-social-media')}
          <br />
          {t('motivation-phrase')}
        </Text>

        <Box display="flex" p="40px 0 0 0" justifyContent="center" gridGap={{ base: '22px', md: '35px' }}>
          {social.map((item) => (
            <Link key={item.icon} href={item.link} target="_blank" rel="noopener noreferrer">
              <Icon icon={item.icon} width="50px" height="50px" />
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default ThankYou;
