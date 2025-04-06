import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  VStack,
} from '@chakra-ui/react';
import Layout from '../components/Layout';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Home() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('project_list')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">프로젝트 목록</Heading>
        
        {loading ? (
          <Text>프로젝트를 불러오는 중...</Text>
        ) : projects.length === 0 ? (
          <Text>등록된 프로젝트가 없습니다.</Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>프로젝트명</Th>
                  <Th>회사</Th>
                  <Th>단계</Th>
                  <Th>상태</Th>
                  <Th>PM</Th>
                  <Th>이해관계자</Th>
                  <Th>기능</Th>
                </Tr>
              </Thead>
              <Tbody>
                {projects.map((project) => (
                  <Tr key={project.id}>
                    <Td>{project.title}</Td>
                    <Td>{project.company}</Td>
                    <Td>{project.stage}</Td>
                    <Td>{project.status}</Td>
                    <Td>{project.pm}</Td>
                    <Td>{project.stakeholder}</Td>
                    <Td>
                      <Box>
                        {project.training && (
                          <Badge colorScheme="green" mr={2}>교육</Badge>
                        )}
                        {project.genai && (
                          <Badge colorScheme="purple" mr={2}>생성AI</Badge>
                        )}
                        {project.digital_output && (
                          <Badge colorScheme="blue">디지털산출물</Badge>
                        )}
                      </Box>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>
    </Layout>
  );
} 