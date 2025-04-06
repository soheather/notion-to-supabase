import { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Button,
  Switch,
  Text,
  useToast,
  Divider,
  HStack,
  Spinner,
} from '@chakra-ui/react';
import Layout from '../components/Layout';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const defaultSettings = {
  reportFormat: 'summary',
  includeChanges: true,
  includeRecommendations: true,
  includeTimeline: true,
  changeTypes: ['status', 'stage', 'pm', 'stakeholder'],
  timeRange: '24h',
};

export default function ReportSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('report_settings')
        .select('settings')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: '설정 로드 오류',
        description: '설정을 불러오는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('report_settings')
        .upsert(
          {
            id: 1,
            settings,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

      if (error) throw error;

      toast({
        title: '설정 저장 완료',
        description: '리포트 설정이 성공적으로 저장되었습니다.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: '설정 저장 오류',
        description: '설정을 저장하는 중 오류가 발생했습니다.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <VStack spacing={8} align="center" justify="center" minH="200px">
          <Spinner size="xl" />
          <Text>설정을 불러오는 중...</Text>
        </VStack>
      </Layout>
    );
  }

  return (
    <Layout>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">리포트 설정</Heading>

        <Box p={6} borderWidth={1} borderRadius="lg" boxShadow="sm">
          <VStack spacing={6} align="stretch">
            <FormControl>
              <FormLabel>리포트 형식</FormLabel>
              <Select
                value={settings.reportFormat}
                onChange={(e) => handleSettingChange('reportFormat', e.target.value)}
              >
                <option value="summary">요약 형식</option>
                <option value="detailed">상세 형식</option>
                <option value="custom">사용자 정의</option>
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>시간 범위</FormLabel>
              <Select
                value={settings.timeRange}
                onChange={(e) => handleSettingChange('timeRange', e.target.value)}
              >
                <option value="24h">최근 24시간</option>
                <option value="7d">최근 7일</option>
                <option value="30d">최근 30일</option>
                <option value="all">전체 기간</option>
              </Select>
            </FormControl>

            <Divider />

            <Text fontWeight="bold">포함 항목</Text>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text>변경 사항 포함</Text>
                <Switch
                  isChecked={settings.includeChanges}
                  onChange={(e) => handleSettingChange('includeChanges', e.target.checked)}
                />
              </HStack>
              <HStack justify="space-between">
                <Text>추천 사항 포함</Text>
                <Switch
                  isChecked={settings.includeRecommendations}
                  onChange={(e) => handleSettingChange('includeRecommendations', e.target.checked)}
                />
              </HStack>
              <HStack justify="space-between">
                <Text>타임라인 포함</Text>
                <Switch
                  isChecked={settings.includeTimeline}
                  onChange={(e) => handleSettingChange('includeTimeline', e.target.checked)}
                />
              </HStack>
            </VStack>

            <Divider />

            <FormControl>
              <FormLabel>변경 유형</FormLabel>
              <VStack align="stretch" spacing={2}>
                {[
                  { key: 'status', label: '상태' },
                  { key: 'stage', label: '단계' },
                  { key: 'pm', label: 'PM' },
                  { key: 'stakeholder', label: '이해관계자' }
                ].map(({ key, label }) => (
                  <HStack key={key} justify="space-between">
                    <Text>{label}</Text>
                    <Switch
                      isChecked={settings.changeTypes.includes(key)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...settings.changeTypes, key]
                          : settings.changeTypes.filter(t => t !== key);
                        handleSettingChange('changeTypes', newTypes);
                      }}
                    />
                  </HStack>
                ))}
              </VStack>
            </FormControl>

            {settings.reportFormat === 'custom' && (
              <FormControl>
                <FormLabel>사용자 정의 프롬프트</FormLabel>
                <Textarea
                  value={settings.customPrompt || ''}
                  onChange={(e) => handleSettingChange('customPrompt', e.target.value)}
                  placeholder="리포트 생성에 사용할 사용자 정의 프롬프트를 입력하세요"
                  size="sm"
                  rows={4}
                />
              </FormControl>
            )}

            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={saving}
              loadingText="저장 중..."
            >
              설정 저장
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Layout>
  );
} 