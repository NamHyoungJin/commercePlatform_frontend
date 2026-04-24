import { apiClient } from './axios';

export interface ScoreMusic {
  music_sid: string;
  kor_name: string;
  eng_name: string;
  music_write: string;
  music_compose: string;
  announcement_year: string;
}

/** 악보 상세의 수록 앨범(구 scoreView.htm «수록 Album») */
/** 동일 곡의 다른 악보 형식(상세 사이드바용) */
export interface ScoreSiblingFormat {
  score_sid: string;
  score_type: string;
  price: number;
  pages: number;
  chord_line: string;
}

export interface ScoreRelatedAlbum {
  album_sid: string;
  name: string;
  artist: string;
  announcement_year: string;
  thumbnail_url: string | null;
  gubn_name: string;
  type_name: string;
  agency: string;
  distribution: string;
  theme_name: string;
  details_theme_name: string;
}

export interface Score {
  score_sid: string;
  title: string;
  title_sub: string;
  price: number;
  pages: number;
  score_type: string;
  score_type_name: string;
  language: string;
  language_name: string;
  chord: string;
  chord_name: string;
  chord_scales?: string;
  chord_scales_name?: string;
  arrange: string;
  hit: number;
  hot: number;
  music: ScoreMusic;
  thumbnail_url: string | null;
  reg_datetime: string;
  doc_type?: string;
  /** 구 scoreView 유튜브 embed (productCategory SYS17713B007) */
  youtube_id?: string | null;
  related_album?: ScoreRelatedAlbum | null;
  /** 샘플 크게보기 — 현재는 썸네일과 동일 URL */
  sample_image_url?: string | null;
  /** 동일 music 기준 형식별 등록 악보(없는 형식은 UI에서 비활성) */
  sibling_formats?: ScoreSiblingFormat[];
  /** 동일 music_sid의 사용 중 악보 전체 */
  music_scores?: Score[];
}

export interface ScoreListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Score[];
}

export interface FilterOption {
  code: string;
  name: string;
}

export interface FilterOptions {
  score_types: FilterOption[];
  languages: FilterOption[];
  chords: FilterOption[];
}

export interface ScoreListParams {
  q?: string;
  /** musicMaster.musicSid — 해당 곡에 연결된 악보만 */
  music_sid?: string;
  type?: string;
  /** productCategoryKind2 (구 PHP ScoreCategoryList) */
  category?: string;
  language?: string;
  chord?: string;
  sort?: 'newest' | 'popular' | 'hot' | 'price_asc' | 'price_desc';
  page?: number;
}

export interface Album {
  album_sid: string;
  name: string;
  second_name: string;
  artist: string;
  announcement_year: string;
  thumbnail_url: string | null;
  /** 앨범 리뷰에서 추린 약 100자 소개 (백엔드) */
  intro: string;
}

/** 구 `score/scorealbum/albumScore` — `/albums/{album_sid}/scores/` */
export interface AlbumScoresTrack {
  track_sid: string;
  cd_number: number;
  track_number: number;
  title: string;
  artist: string;
  scores: Score[];
}

export interface AlbumScoresBundle {
  album: Album & {
    gubn_name: string;
    type_name: string;
    agency: string;
    distribution: string;
    theme_name: string;
    details_theme_name: string;
  };
  tracks: AlbumScoresTrack[];
}

/** 메인 동영상 악보 (productCategory 유튜브 연동) */
export interface VideoScoreItem {
  score_sid: string;
  youtube_id: string;
  youtube_thumbnail_url: string | null;
  title: string;
  music_write: string;
  music_compose: string;
  score_type_name: string;
  language_name: string;
  chord_name: string;
  chord_scales_name: string;
}

/** 구 `/searchpopup/scoreLyric` JSON에 대응 */
export interface ScoreLyricsResponse {
  score_sid: string;
  music_score_title: string;
  music_kor_name: string;
  music_eng_name: string;
  music_write: string;
  music_compose: string;
  lyrics: string;
}

export const scoresApi = {
  list: (params?: ScoreListParams) =>
    apiClient.get<ScoreListResponse>('/scores/', { params }),

  detail: (scoreSid: string) =>
    apiClient.get<Score>(`/scores/${scoreSid}/`),

  lyrics: (scoreSid: string) =>
    apiClient.get<ScoreLyricsResponse>(`/scores/${scoreSid}/lyrics/`),

  filters: () =>
    apiClient.get<FilterOptions>('/scores-filters/'),

  albumsLatest: () =>
    apiClient.get<Album[]>('/albums/latest/'),

  albumScoresBundle: (albumSid: string) =>
    apiClient.get<AlbumScoresBundle>(`/albums/${albumSid}/scores/`),

  popular: () =>
    apiClient.get<Score[]>('/scores/popular/'),

  latest: () =>
    apiClient.get<Score[]>('/scores/latest/'),

  youtubeScores: (limit = 6) =>
    apiClient.get<VideoScoreItem[]>('/scores/youtube/', { params: { limit } }),
};
