import type { DishArt } from '@/config/treat'
import { biryani } from './biryani'
import { jamun } from './jamun'
import { parotta } from './parotta'
import { pizza } from './pizza'
import type { DishArtSpec } from './shared'

export const dishArt: Record<DishArt, DishArtSpec> = { biryani, parotta, pizza, jamun }
