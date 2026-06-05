export interface ScoreResponseDto {
  nick: string;
  score: number;
}

export interface ScoreRankDto extends ScoreResponseDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ScoreOutcome =
  | { status: 'registered'; record: ScoreResponseDto }
  | { status: 'updated'; record: ScoreResponseDto }
  | { status: 'kept'; record: ScoreResponseDto };
