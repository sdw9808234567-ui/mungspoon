# 간식 사진 8장 만들기 (AI 이미지 생성용 문구)

앱의 간식 이미지는 **실제 사진**이 들어가도록 만들어져 있어요.
반려견 사진은 쓰지 않고, 간식 제품 사진만 사용해요.
아래 문구를 이미지 생성 도구(Higgsfield, ChatGPT 이미지 등)에 붙여넣어 사진을 만든 뒤 Claude에게 보내 주세요.
8장 모두 같은 "공통 문구"를 써야 조명·배경이 통일돼요.

## 공통 문구 (모든 사진 끝에 붙이기)
```
professional product photography for a premium pet bakery catalog, shot on a full-frame camera with 85mm lens,
soft diffused studio light from the upper left, natural soft shadow, matte ceramic plate in warm off-white,
light beige linen backdrop, shallow depth of field, true-to-life colors, realistic crumb and surface texture,
no glossy plastic look, no 3D render, no illustration, no text, no people, no chocolate, no grapes, no raisins,
no nuts, no sugar sprinkles, no icing sugar, landscape 6:5 composition, subject centered
```

## 종류별 문구 (공통 문구 앞에 붙이기)
| 파일 이름 | 문구 |
|---|---|
| `cookie.jpg` | `homemade dog cookies made from pumpkin and rice flour, round and bone-shaped, matte golden-orange surface with fine cracks, one cookie broken to show the dense crumb,` |
| `bread.jpg` | `small steamed dog bread buns made from rice flour and sweet potato, soft pale-yellow matte surface, one bun torn open showing the fluffy moist crumb with sweet potato pieces,` |
| `muffin.jpg` | `three mini dog muffins in plain unbleached paper cups, made from sweet potato and egg, a few fresh blueberries baked in, one muffin cut in half showing the crumb,` |
| `cake.jpg` | `a small homemade dog cake, two layers of rice-flour sponge with plain unsweetened yogurt cream, topped with fresh blueberries and thin banana slices, one slice cut out to show the layers,` |
| `pudding.jpg` | `pumpkin egg pudding for dogs in a small white ramekin, smooth moist golden surface, a spoonful taken out showing the silky texture,` |
| `donut.jpg` | `oven-baked dog donuts made from sweet potato and rice flour, matte golden surface, thin plain yogurt glaze on top with finely grated carrot, not fried, not shiny,` |
| `bite.jpg` | `small bite-size dog treats, round balls made from chicken breast, carrot and rice flour, lightly baked, visible carrot flecks, a small pile on the plate,` |
| `soft.jpg` | `soft jelly-like dog treats cut into small cubes, made from tofu and apple, pale cream color, slightly translucent matte surface, a few thin fresh apple slices beside them,` |

## 홈 화면 대표 배너 사진 (1장)
파일 이름 `hero.jpg`, 가로로 긴 4:3 사진. 아래 문구 + 공통 문구를 함께 넣어 주세요.
```
an assortment of homemade dog treats arranged on a matte off-white ceramic platter: pumpkin cookies,
mini sweet potato muffins with blueberries, a small yogurt-cream cake slice, baked donuts and bite-size chicken treats,
styled like a premium pet bakery display, slightly angled top-down view,
```

## 주의
- 사진에 **초콜릿·포도·건포도·견과류·설탕 장식**이 보이면 다시 만들어 주세요. (강아지에게 위험한 재료예요)
- 가로로 긴 사진(6:5)이 가장 잘 맞아요. 크기는 Claude가 960×800으로 맞춰 넣어요.
