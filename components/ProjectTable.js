import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  Text
} from '@chakra-ui/react';

export default function ProjectTable({ projects, loading }) {
  if (loading) {
    return (
      <Table>
        <Thead>
          <Tr>
            <Th>Title</Th>
            <Th>Company</Th>
            <Th>Stage</Th>
            <Th>Status</Th>
            <Th>PM</Th>
            <Th>Expected Schedule</Th>
          </Tr>
        </Thead>
        <Tbody>
          {[...Array(5)].map((_, i) => (
            <Tr key={i}>
              {[...Array(6)].map((_, j) => (
                <Td key={j}>
                  <Skeleton height="20px" />
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  }

  return (
    <Table>
      <Thead>
        <Tr>
          <Th>Title</Th>
          <Th>Company</Th>
          <Th>Stage</Th>
          <Th>Status</Th>
          <Th>PM</Th>
          <Th>Expected Schedule</Th>
        </Tr>
      </Thead>
      <Tbody>
        {projects.map((project) => (
          <Tr key={project.id}>
            <Td>
              <Text fontWeight="medium">{project.title}</Text>
            </Td>
            <Td>{project.company}</Td>
            <Td>
              <Badge colorScheme={getStageColor(project.stage)}>
                {project.stage}
              </Badge>
            </Td>
            <Td>{project.status}</Td>
            <Td>{project.pm}</Td>
            <Td>{project.expected_schedule || '-'}</Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
}

function getStageColor(stage) {
  if (!stage) return 'gray';
  if (stage.includes('완료')) return 'green';
  if (stage.includes('진행중')) return 'blue';
  if (stage.includes('진행예정')) return 'yellow';
  return 'gray';
} 