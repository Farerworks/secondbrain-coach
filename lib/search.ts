import Fuse from 'fuse.js';
import detailedKnowledgeJson from '@/data/detailed-knowledge.json';
import drGardnerCore from '@/data/dr-gardner/core-concepts.json';
import drGardnerPara from '@/data/dr-gardner/para-system.json';
import drGardnerCode from '@/data/dr-gardner/code-method.json';
import drGardnerNotion from '@/data/dr-gardner/notion-setup.json';
import drGardnerAutomation from '@/data/dr-gardner/automation.json';
import drGardnerTroubleshooting from '@/data/dr-gardner/troubleshooting.json';

// 지식 베이스 타입 정의
interface KnowledgeItem {
  id: string;
  category: string;
  title: string;
  content: string;
  keywords: string[];
  examples?: string[];
  relatedTopics?: string[];
  tags?: string[];
  type?: string;
  keyPoints?: string[];
  summary?: string;
}

// 기본 지식 베이스 (기존 코드 유지)
const defaultKnowledge: KnowledgeItem[] = [
  {
    id: "para-basic",
    category: "PARA",
    title: "PARA 시스템 기초",
    content: "PARA는 Projects, Areas, Resources, Archives의 약자로, 정보를 체계적으로 정리하는 시스템입니다. 프로젝트는 끝이 있는 목표, 영역은 지속적인 책임, 자원은 미래 참고용 정보, 아카이브는 비활성 정보입니다.",
    keywords: ["para", "프로젝트", "영역", "자원", "아카이브", "정리", "시스템"],
    relatedTopics: ["프로젝트와 영역의 차이", "PARA 실전 적용법", "자원 관리 방법"]
  },
  {
    id: "project-area-diff",
    category: "PARA",
    title: "프로젝트와 영역의 차이",
    content: "프로젝트와 영역의 가장 중요한 차이는 '끝이 있느냐 없느냐'입니다. 프로젝트는 명확한 완료 시점이 있는 목표(예: 이사하기, 책 쓰기)이고, 영역은 지속적으로 유지해야 하는 책임(예: 건강 관리, 재정 관리)입니다.",
    keywords: ["프로젝트", "영역", "차이", "구분", "끝", "목표", "책임"],
    relatedTopics: ["PARA 시스템 기초", "프로젝트 관리법", "영역 설정 방법"]
  },
  {
    id: "code-method",
    category: "CODE",
    title: "CODE 방법론",
    content: "CODE는 Capture(수집), Organize(정리), Distill(추출), Express(표현)의 약자입니다. 정보를 빠르게 수집하고, 체계적으로 정리하며, 핵심을 추출하여, 최종적으로 가치있는 결과물로 표현하는 프로세스입니다.",
    keywords: ["code", "수집", "정리", "추출", "표현", "방법론", "프로세스"],
    relatedTopics: ["빠른 수집 방법", "효과적인 정리법", "핵심 추출 기술"]
  },
  {
    id: "health-project",
    category: "PARA",
    title: "건강 관리를 Second Brain에 적용하기",
    content: "다이어트나 운동 목표는 기한이 있다면 '프로젝트'로, 지속적인 건강 관리는 '영역'으로 설정합니다. 운동 루틴, 식단 정보는 '자원'에, 과거 다이어트 기록은 '아카이브'에 보관합니다. 매일의 운동과 식단은 할 일로 관리하고, 주간 리뷰에서 진행 상황을 점검합니다.",
    keywords: ["건강", "다이어트", "운동", "살빼기", "체중", "프로젝트", "습관"],
    examples: ["방학 중 5kg 감량 프로젝트", "매일 아침 운동 습관", "주간 체중 기록"],
    relatedTopics: ["습관 추적 방법", "프로젝트 목표 설정", "건강 영역 관리"]
  },
  {
    id: "note-splitting",
    category: "NOTES",
    title: "노트 쪼개기 (원자적 노트)",
    content: "원자적 노트는 하나의 아이디어만 담은 독립적인 노트입니다. 긴 노트를 여러 개의 작은 노트로 쪼개면 재사용성이 높아지고, 아이디어 간 연결이 쉬워집니다. 각 노트는 독립적으로 이해 가능해야 하며, 명확한 제목을 가져야 합니다.",
    keywords: ["노트", "쪼개기", "원자적", "아이디어", "분리", "정리"],
    examples: ["회의록을 액션 아이템별로 분리", "책 요약을 챕터별로 쪼개기"],
    relatedTopics: ["효과적인 노트 작성법", "노트 연결하기", "제목 짓기 팁"]
  }
];

// 닥터가드너 데이터를 평면화하는 함수
function flattenDrGardnerData(data: any): KnowledgeItem[] {
  const flattened: KnowledgeItem[] = [];
  
  Object.entries(data).forEach(([key, value]: [string, any]) => {
    if (value && typeof value === 'object') {
      // keywords 배열 생성 (tags와 keyPoints 결합)
      const keywords = [
        ...(value.tags || []),
        ...(value.keyPoints || []),
        value.title || ''
      ].filter(Boolean);
      
      flattened.push({
        id: value.id || key,
        category: value.category || '닥터가드너',
        title: value.title || key,
        content: value.content || '',
        keywords: keywords,
        tags: value.tags || [],
        type: 'dr-gardner',
        examples: value.examples || [],
        relatedTopics: value.relatedTopics || value.relatedQuestions || [],
        summary: value.summary || '',
        keyPoints: value.keyPoints || [],
        ...value
      });
    }
  });
  
  return flattened;
}

// 지식 베이스 로드 시도
let knowledgeItems: KnowledgeItem[] = defaultKnowledge;
let drGardnerItems: KnowledgeItem[] = [];

// detailed-knowledge.json 로드 (존재하면 items 사용)
if ((detailedKnowledgeJson as any)?.items) {
  knowledgeItems = (detailedKnowledgeJson as any).items as KnowledgeItem[];
}

// 닥터가드너 콘텐츠 로드(정적 import)
drGardnerItems = [
  ...flattenDrGardnerData(drGardnerCore as any),
  ...flattenDrGardnerData(drGardnerPara as any),
  ...flattenDrGardnerData(drGardnerCode as any),
  ...flattenDrGardnerData(drGardnerNotion as any),
  ...flattenDrGardnerData(drGardnerAutomation as any),
  ...flattenDrGardnerData(drGardnerTroubleshooting as any)
];

// 모든 지식 항목 통합
const allKnowledgeItems = [...knowledgeItems, ...drGardnerItems];

// Fuse.js 검색 옵션 설정
const fuseOptions = {
  keys: [
    { name: 'title', weight: 0.3 },
    { name: 'content', weight: 0.4 },
    { name: 'keywords', weight: 0.3 },
    { name: 'tags', weight: 0.2 },
    { name: 'summary', weight: 0.2 }
  ],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  shouldSort: true,
  findAllMatches: true
};

// Fuse 인스턴스 생성
const fuse = new Fuse(allKnowledgeItems, fuseOptions);

// 한국어 처리를 위한 헬퍼 함수
function normalizeKoreanQuery(query: string): string {
  return query
    .replace(/[을를이가은는에서와과의로으로]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// 검색 함수 export
export async function searchKnowledge(query: string) {
  console.log('🔍 검색 쿼리:', query);
  
  // 쿼리 정규화
  const normalizedQuery = normalizeKoreanQuery(query);
  console.log('📝 정규화된 쿼리:', normalizedQuery);
  
  // 검색 수행
  let results = fuse.search(normalizedQuery);
  
  // 닥터가드너 콘텐츠 우선 정렬
  results = results.sort((a, b) => {
    const aIsDrGardner = a.item.type === 'dr-gardner';
    const bIsDrGardner = b.item.type === 'dr-gardner';
    
    // 닥터가드너 콘텐츠를 우선
    if (aIsDrGardner && !bIsDrGardner) return -1;
    if (!aIsDrGardner && bIsDrGardner) return 1;
    
    // 같은 타입이면 점수로 정렬
    return (a.score || 0) - (b.score || 0);
  });
  
  // 특정 키워드에 대한 우선순위 처리 (기존 로직 유지)
  if (query.match(/살|다이어트|운동|건강|체중/)) {
    const healthResults = fuse.search('건강 다이어트 운동');
    if (healthResults.length > 0) {
      const healthIds = new Set(healthResults.map(r => r.item.id));
      const filteredResults = results.filter(r => !healthIds.has(r.item.id));
      results = [...healthResults, ...filteredResults];
    }
  }
  
  // 세컨드브레인 관련 키워드 우선순위
  if (query.match(/세컨드브레인|세컨브레인|second brain|템플릿/i)) {
    const secondBrainResults = results.filter(r => 
      r.item.type === 'dr-gardner' || 
      r.item.category?.includes('닥터가드너')
    );
    const otherResults = results.filter(r => 
      r.item.type !== 'dr-gardner' && 
      !r.item.category?.includes('닥터가드너')
    );
    results = [...secondBrainResults, ...otherResults];
  }
  
  console.log(`✅ 검색 결과: ${results.length}개`);
  console.log(`📊 닥터가드너 콘텐츠: ${results.filter(r => r.item.type === 'dr-gardner').length}개`);
  
  return results.slice(0, 10); // 상위 10개 결과 반환
}

// 카테고리별 검색 함수
export async function searchByCategory(category: string) {
  const categoryItems = allKnowledgeItems.filter(item => 
    item.category.toLowerCase() === category.toLowerCase() ||
    item.category.includes(category)
  );
  return categoryItems;
}

// 관련 주제 찾기 함수
export async function findRelatedTopics(currentTopic: string) {
  const results = await searchKnowledge(currentTopic);
  const relatedTopics = new Set<string>();
  
  results.forEach(result => {
    if (result.item.relatedTopics) {
      result.item.relatedTopics.forEach(topic => relatedTopics.add(topic));
    }
  });
  
  return Array.from(relatedTopics);
}

// 닥터가드너 전용 검색 함수 (추가)
export async function searchDrGardner(query: string) {
  const drGardnerFuse = new Fuse(drGardnerItems, fuseOptions);
  const normalizedQuery = normalizeKoreanQuery(query);
  const results = drGardnerFuse.search(normalizedQuery);
  
  console.log(`🎯 닥터가드너 전용 검색 결과: ${results.length}개`);
  return results;
}