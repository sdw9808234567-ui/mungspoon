# 멍스푼 모바일 화면 자동 테스트 (스마트폰 크기 390x844, 터치 사용)
# 실행: python3 tests/ui-test.py  (서버가 3000번에서 켜져 있어야 함)
import sys
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
SHOTS = sys.argv[1] if len(sys.argv) > 1 else "/tmp/shots"
PHOTO = sys.argv[2] if len(sys.argv) > 2 else "/tmp/shots/photo.jpg"
results = []
def seen(locator, ms=5000):
    """화면에 나타날 때까지 잠깐 기다렸다가 보이는지 확인"""
    try:
        locator.first.wait_for(state="visible", timeout=ms); return True
    except Exception:
        return False
def check(name, cond):
    results.append(cond); print(("✅ " if cond else "❌ ") + name)

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path="/usr/bin/google-chrome", args=["--no-sandbox"])
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, has_touch=True, is_mobile=True, locale="ko-KR")
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)

    # ── 홈 화면 요소 9가지 ──
    page.goto(BASE); page.wait_for_load_state("networkidle")
    for text in ["멍스푼", "강아지 프로필 등록하기", "오늘의 추천 레시피", "내 재료로 간식 만들기", "재료 안전성 검사", "기본 수제간식", "종류별로 만들기", "최근 본 레시피"]:
        check(f"홈: '{text}' 보임", page.get_by_text(text, exact=False).first.is_visible())
    check("홈: 하단 내비게이션 5개", page.locator("nav a").count() == 5)
    check("홈: 가로 넘침 없음", page.evaluate("document.documentElement.scrollWidth <= 390"))
    page.screenshot(path=f"{SHOTS}/01-home.png", full_page=True)

    # ── 프로필 저장 → 새로고침 후 불러오기 ──
    page.locator("nav a", has_text="프로필").tap(); page.wait_for_url("**/profile")
    page.get_by_label("이름").fill("테스트견")
    page.get_by_label("체중 (kg)").fill("8.5")
    page.get_by_label("나이").fill("1살")
    page.get_by_label("알레르기").fill("닭, 유제품")
    page.get_by_role("button", name="프로필 저장하기").tap()
    check("프로필: 저장 안내", seen(page.get_by_text("프로필을 저장했어요.")))
    page.reload(); page.wait_for_load_state("networkidle")
    check("프로필: 새로고침 후 이름 유지", page.get_by_label("이름").input_value() == "테스트견")
    check("프로필: 새로고침 후 알레르기 유지", page.get_by_label("알레르기").input_value() == "닭, 유제품")
    page.screenshot(path=f"{SHOTS}/02-profile.png", full_page=True)
    page.goto(BASE); page.wait_for_load_state("networkidle")
    check("홈: 프로필 이름·알레르기 표시", page.get_by_text("알레르기: 닭, 유제품").is_visible())

    # ── 재료 없이 실행 ──
    page.locator("nav a", has_text="만들기").tap(); page.wait_for_url("**/make")
    page.get_by_role("button", name="안전성 분석하기").tap()
    check("만들기: 재료 없이 누르면 안내", page.get_by_role("alert").filter(has_text="하나 이상").is_visible())

    # ── 프로필 알레르기 재료(닭가슴살) → 차단 ──
    page.get_by_role("button", name="닭가슴살", exact=True).tap()
    page.get_by_role("button", name="단호박", exact=True).tap()
    page.get_by_role("button", name="안전성 분석하기").tap()
    page.get_by_text("안전성 분석 결과").wait_for()
    check("만들기: 알레르기 재료 차단 안내", page.get_by_text("이 아이에게는 사용 금지 (프로필)").is_visible())
    check("만들기: 차단 시 레시피 버튼 없음", page.get_by_role("button", name="이 재료로 레시피 만들기").count() == 0)
    page.get_by_role("button", name="빼기").tap()   # 결과 카드에서 바로 빼기

    # ── 정상 + 위험(직접 입력 '건포도') 혼합 → 중단 ──
    check("만들기: 가로 넘침 없음", page.evaluate("document.documentElement.scrollWidth <= 390"))
    page.get_by_label("목록에 없는 재료 직접 입력").fill("건포도")
    page.get_by_role("button", name="추가", exact=True).tap()
    page.get_by_role("button", name="쌀가루", exact=True).tap()
    page.get_by_role("button", name="안전성 분석하기").tap()
    page.get_by_text("안전성 분석 결과").wait_for()
    check("만들기: 위험 재료 혼합 시 생성 중단 안내", page.get_by_role("alert").filter(has_text="레시피를 만들지 않아요").is_visible())
    check("만들기: '사용 금지' 표시", seen(page.locator("span", has_text="사용 금지")))
    page.screenshot(path=f"{SHOTS}/03-blocked.png", full_page=True)
    page.get_by_role("button", name="건포도 빼기").tap()

    # ── 정상 + 정보 부족('용과') → 보류 제외 후 생성 ──
    page.get_by_label("목록에 없는 재료 직접 입력").fill("용과")
    page.get_by_role("button", name="추가", exact=True).tap()
    page.get_by_role("button", name="안전성 분석하기").tap()
    page.get_by_text("안전성 분석 결과").wait_for()
    check("만들기: 미확인 재료 '분석 보류' 표시", page.get_by_text("정보 부족으로 분석 보류").is_visible())
    check("만들기: 출처 펼쳐 보기", page.get_by_text("주의사항·조리법·출처 보기").first.is_visible())
    page.get_by_text("주의사항·조리법·출처 보기").first.tap()
    check("만들기: 출처 링크·검증 상태 표시", page.get_by_text("검증 상태:").first.is_visible() and page.locator("a[href*='akc.org']").first.is_visible())
    page.screenshot(path=f"{SHOTS}/04-analysis.png", full_page=True)

    # 종류 선택 없이 누르기 → 안내
    page.get_by_role("button", name="이 재료로 레시피 만들기").tap()
    check("만들기: 종류 미선택 안내", page.get_by_role("alert").filter(has_text="간식 종류").is_visible())
    page.get_by_role("button", name="쿠키").tap()
    page.get_by_role("button", name="이 재료로 레시피 만들기").tap()
    page.wait_for_url("**/recipe?id=*")
    page.get_by_role("heading", name="단호박 쿠키").wait_for()
    check("레시피: 생성 후 상세 화면 이동", True)
    for text in ["재료와 계량", "만드는 방법", "익힘 확인 방법", "보관 기간", "급여 시 주의사항", "예상 열량", "조리 온도", "조리 시간", "분석 보류로 레시피에서 제외한 재료: 용과"]:
        check(f"레시피: '{text}' 보임", page.get_by_text(text, exact=False).first.is_visible())
    check("레시피: 가로 넘침 없음", page.evaluate("document.documentElement.scrollWidth <= 390"))
    page.screenshot(path=f"{SHOTS}/05-recipe.png", full_page=True)
    recipe_url = page.url

    # ── 즐겨찾기 + 만든 기록(사진) ──
    page.get_by_role("button", name="☆ 즐겨찾기").tap()
    check("레시피: 즐겨찾기 켜짐", page.get_by_role("button", name="★ 즐겨찾기됨").is_visible())
    page.get_by_role("button", name="이 간식 만들었어요").tap()
    page.get_by_label("메모").fill("테스트 메모입니다")
    page.get_by_label("완성 사진 (선택)").set_input_files(PHOTO)
    page.get_by_alt_text("선택한 완성 사진 미리보기").wait_for()
    page.get_by_role("button", name="기록 저장하기").tap()
    check("레시피: 만든 기록 저장 안내", page.get_by_text("만든 기록을 저장했어요.").is_visible())
    size = page.evaluate("JSON.parse(localStorage.getItem('ms_logs'))[0].photo.length")
    check(f"레시피: 사진이 작게 줄어 저장됨 ({size//1024}KB)", 0 < size < 300_000)

    # ── 보관함: 새로고침해도 남아 있는지 ──
    page.goto(BASE + "/box"); page.wait_for_load_state("networkidle")
    check("보관함: 최근 생성에 레시피", page.get_by_text("단호박 쿠키").first.is_visible())
    page.get_by_role("tab", name="즐겨찾기").tap()
    check("보관함: 즐겨찾기 탭에 레시피", seen(page.get_by_role("tab", name="즐겨찾기", selected=True)) and seen(page.get_by_text("단호박 쿠키")))
    page.get_by_role("tab", name="만든 기록").tap()
    check("보관함: 만든 기록에 메모·사진", seen(page.get_by_text("테스트 메모입니다")) and seen(page.locator("img[alt*='직접 만든 사진']")))
    page.screenshot(path=f"{SHOTS}/06-box.png", full_page=True)
    page.goto(recipe_url); page.wait_for_load_state("networkidle")
    check("레시피: 주소로 다시 열어도 보임", page.get_by_role("heading", name="단호박 쿠키").is_visible())
    page.goto(BASE); page.wait_for_load_state("networkidle")
    check("홈: 최근 본 레시피에 표시", page.get_by_text("단호박 쿠키").first.is_visible())

    # ── 안전검사 화면 + 블로그 + 기본 조합 링크 ──
    page.locator("nav a", has_text="안전검사").tap(); page.wait_for_url("**/check")
    page.get_by_role("button", name="브로콜리", exact=True).tap()
    page.get_by_role("button", name="안전성 분석하기").tap()
    check("안전검사: '조건과 양에 주의' 표시", seen(page.get_by_text("조건과 양에 주의")))
    page.goto(BASE + "/blog"); page.wait_for_load_state("networkidle")
    check("블로그: 메뉴 3개", all(page.get_by_text(t).is_visible() for t in ["블로그 방문하기", "실제 수제간식 제작 후기", "블로그 레시피 보기"]))
    check("블로그: 버튼 3개가 실제 블로그 주소로 연결", page.locator("a[href='https://blog.naver.com/ssm4579']").count() == 3)
    page.goto(BASE); page.wait_for_load_state("networkidle")
    page.locator("a[href*='/make?type=']").first.tap(); page.wait_for_url("**/make?type=*")
    check("홈→기본 조합: 재료가 미리 선택됨", page.locator("button[aria-pressed='true']").count() >= 2)

    # ── 서버가 꺼졌을 때(연결 실패) 안내 ──
    page.route("**/api/analyze", lambda r: r.abort())
    page.get_by_role("button", name="안전성 분석하기").tap()
    check("연결 실패: 안내 문구", seen(page.get_by_role("alert").filter(has_text="연결하지 못했어요")))

    real = [e for e in errors if "ERR_FAILED" not in e and "Failed to load resource" not in e]
    check(f"브라우저 오류 없음 {real[:2] if real else ''}", not real)
    browser.close()

print(f"\n결과: 통과 {sum(results)} / 실패 {len(results) - sum(results)}")
sys.exit(0 if all(results) else 1)
