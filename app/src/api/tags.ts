// app/src/api/tags.ts
import axios from 'axios'

export function fetchTags() {
  return axios.get<string[]>('/api/diaries/tags')
}
