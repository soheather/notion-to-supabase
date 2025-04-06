import React from 'react';
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
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function Reports() {
  const [changes, setChanges] = React.useState({
    new: [],
    stage: [],
    insight: null
  });

  React.useEffect(() => {
    async function fetchData() {
      try {
        // 신규 프로젝트 조회 (최근 1주일)
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        const { data: newProjects } = await supabase
          .from('project_changes')
          .select('id, project_title, old_value, new_value, field_name, created_at, department, manager')
          .eq('field', 'registration')
          .gte('created_at', lastWeek.toISOString())
          .order('created_at', { ascending: false });

        // 단계 변경 프로젝트 조회 (최근 1주일)
        const { data: stageChanges } = await supabase
          .from('project_changes')
          .select('id, project_title, old_value, new_value, field_name, created_at, department, manager')
          .eq('field', 'stage')
          .gte('created_at', lastWeek.toISOString())
          .order('created_at', { ascending: false });

        // GPT 인사이트 조회
        const { data: insights } = await supabase
          .from('reports')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);

        setChanges({
          new: newProjects || [],
          stage: stageChanges || [],
          insight: insights?.[0]
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    fetchData();
  }, []);

  return (
    <Layout>
      <Box p={6}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>📋 2월 2주차 프로젝트 현황 리포트</Heading>
          </Box>

          {/* 신규 프로젝트 섹션 */}
          <Box>
            <HStack mb={4}>
              <Heading size="md">신규 프로젝트</Heading>
              <Badge colorScheme="red" fontSize="md">{changes.new.length}건</Badge>
            </HStack>
            <Table variant="simple" bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>진행 확정</Th>
                  <Th>부서</Th>
                  <Th>프로젝트명</Th>
                  <Th>담당자</Th>
                </Tr>
              </Thead>
              <Tbody>
                {changes.new.map((project) => (
                  <Tr key={project.id}>
                    <Td>
                      <Box w={3} h={3} borderRadius="full" bg={project.new_value === 'confirmed' ? 'green.400' : 'gray.300'} />
                    </Td>
                    <Td>{project.department}</Td>
                    <Td>{project.project_title}</Td>
                    <Td>{project.manager}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* 진행 단계 변경 섹션 */}
          <Box>
            <HStack mb={4}>
              <Heading size="md">진행 단계 변경</Heading>
              <Badge colorScheme="red" fontSize="md">{changes.stage.length}건</Badge>
            </HStack>
            <Table variant="simple" bg="white" borderRadius="lg" overflow="hidden" boxShadow="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th>이전 단계</Th>
                  <Th>부서</Th>
                  <Th>프로젝트명</Th>
                  <Th>변경 단계</Th>
                  <Th>담당자</Th>
                </Tr>
              </Thead>
              <Tbody>
                {changes.stage.map((change) => (
                  <Tr key={change.id}>
                    <Td>{change.old_value}</Td>
                    <Td>{change.department}</Td>
                    <Td>{change.project_title}</Td>
                    <Td>
                      <Badge colorScheme="green">
                        {change.new_value}
                      </Badge>
                    </Td>
                    <Td>{change.manager}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* GPT 인사이트 섹션 */}
          {changes.insight && (
            <Box>
              <Heading size="md" mb={4}>🤖 GPT 프로젝트 현황 인사이트</Heading>
              <Card>
                <CardBody>
                  <Text whiteSpace="pre-line">{changes.insight.content}</Text>
                </CardBody>
              </Card>
            </Box>
          )}
        </VStack>
      </Box>
    </Layout>
  );
} 