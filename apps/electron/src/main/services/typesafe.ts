import { choice, TypeSafeClient } from '@typesafe-ai/sdk'

const dataFileKindQuestion = choice(
  '파일 이름, 형식, 내용 미리보기를 근거로 이 게임 데이터 파일의 종류를 선택하세요.',
  {
    equipment: '장비, 무기, 방어구, 장신구 또는 잠재옵션 데이터',
    skill: '직업 스킬, 스킬 레벨 또는 스킬 효과 데이터',
    class: '직업, 전직, 직업 계열 또는 직업 코드 데이터',
    monster: '몬스터, 보스 또는 몬스터 전투 데이터',
    unknown: '제시된 분류 중 하나로 판단할 근거가 부족한 데이터'
  }
)

export type DataFileKind = keyof typeof dataFileKindQuestion.criteria

export type DataFileClassification = {
  kind: DataFileKind
  confidence: number
  probabilities: Record<DataFileKind, number>
  model: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

let client: TypeSafeClient | undefined

function getClient(): TypeSafeClient {
  client ??= new TypeSafeClient()
  return client
}

export async function classifyDataFile(input: {
  fileName: string
  format: 'csv' | 'json'
  preview: string
}): Promise<DataFileClassification> {
  const response = await getClient().systemOne({
    state: input,
    questions: {
      dataFileKind: dataFileKindQuestion
    }
  })
  const answer = response.answers.dataFileKind

  return {
    kind: answer.choice,
    confidence: answer.confidence,
    probabilities: answer.probabilities,
    model: response.model,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    }
  }
}
