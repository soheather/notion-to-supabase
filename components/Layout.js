import { Box, Container, Flex, Link as ChakraLink } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const router = useRouter();

  return (
    <Box minH="100vh">
      <Box bg="blue.500" color="white" py={4} mb={8}>
        <Container maxW="container.lg">
          <Flex gap={6}>
            <ChakraLink
              as={Link}
              href="/"
              fontSize="lg"
              fontWeight={router.pathname === '/' ? 'bold' : 'normal'}
              _hover={{ textDecoration: 'none', opacity: 0.8 }}
            >
              프로젝트 목록
            </ChakraLink>
            <ChakraLink
              as={Link}
              href="/reports"
              fontSize="lg"
              fontWeight={router.pathname === '/reports' ? 'bold' : 'normal'}
              _hover={{ textDecoration: 'none', opacity: 0.8 }}
            >
              변경 리포트
            </ChakraLink>
            <ChakraLink
              as={Link}
              href="/report-settings"
              fontSize="lg"
              fontWeight={router.pathname === '/report-settings' ? 'bold' : 'normal'}
              _hover={{ textDecoration: 'none', opacity: 0.8 }}
            >
              리포트 설정
            </ChakraLink>
          </Flex>
        </Container>
      </Box>
      <Container maxW="container.lg">
        {children}
      </Container>
    </Box>
  );
} 