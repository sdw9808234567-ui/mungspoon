"use client";
// 강아지 프로필 화면 — 입력한 내용은 레시피를 만들 때 참고합니다.
import { useState } from "react";
import { BigButton, PageTitle, TopBar } from "@/components/ui";
import { KEYS, useProfile, write } from "@/lib/store";
import type { DogProfile } from "@/lib/types";

export default function ProfilePage() {
  const [saved, loaded] = useProfile();
  return (
    <main>
      <TopBar />
      <PageTitle title="강아지 프로필" sub="알레르기와 못 먹는 재료를 적어 두면, 그 재료가 들어간 레시피는 만들지 않아요." />
      {/* 저장된 값을 다 불러온 뒤에 입력 폼을 보여 줍니다 */}
      {loaded ? <Form initial={saved} /> : <p className="px-5 text-muted">불러오는 중…</p>}
    </main>
  );
}

/** 쉼표로 구분한 글자를 목록으로 바꾸기: "닭, 유제품" → ["닭","유제품"] */
const toList = (s: string) => s.split(/[,，、\n]/).map((x) => x.trim()).filter(Boolean);

function Form({ initial }: { initial: DogProfile }) {
  const [name, setName] = useState(initial.name);
  const [weightKg, setWeightKg] = useState(initial.weightKg);
  const [age, setAge] = useState(initial.age);
  const [allergies, setAllergies] = useState(initial.allergies.join(", "));
  const [forbidden, setForbidden] = useState(initial.forbidden.join(", "));
  const [healthNotes, setHealthNotes] = useState(initial.healthNotes);
  const [msg, setMsg] = useState("");

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const profile: DogProfile = {
      name: name.trim(),
      weightKg: weightKg.trim(),
      age: age.trim(),
      allergies: toList(allergies),
      forbidden: toList(forbidden),
      healthNotes: healthNotes.trim(),
    };
    setMsg(write(KEYS.profile, profile) ? "프로필을 저장했어요." : "저장하지 못했어요. 브라우저 저장 공간을 확인해 주세요.");
  };

  const field = "mt-1 min-h-13 w-full rounded-xl border-2 border-sand bg-paper px-4 py-3 text-[18px]";
  return (
    <form onSubmit={save} className="space-y-5 px-5">
      <label className="block">
        <span className="font-semibold">이름</span>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={20} placeholder="예: 콩이" className={field} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="font-semibold">체중 (kg)</span>
          <input value={weightKg} onChange={(e) => setWeightKg(e.target.value)} inputMode="decimal" maxLength={6} placeholder="예: 8.5" className={field} />
        </label>
        <label className="block">
          <span className="font-semibold">나이</span>
          <input value={age} onChange={(e) => setAge(e.target.value)} maxLength={10} placeholder="예: 1살" className={field} />
        </label>
      </div>
      <label className="block">
        <span className="font-semibold">알레르기</span>
        <span className="block text-[15px] text-muted">쉼표(,)로 나누어 적어 주세요.</span>
        <input value={allergies} onChange={(e) => setAllergies(e.target.value)} maxLength={200} placeholder="예: 닭, 유제품" className={field} />
      </label>
      <label className="block">
        <span className="font-semibold">먹으면 안 되는 재료</span>
        <span className="block text-[15px] text-muted">쉼표(,)로 나누어 적어 주세요.</span>
        <input value={forbidden} onChange={(e) => setForbidden(e.target.value)} maxLength={200} placeholder="예: 두부" className={field} />
      </label>
      <label className="block">
        <span className="font-semibold">건강 관련 주의사항</span>
        <textarea value={healthNotes} onChange={(e) => setHealthNotes(e.target.value)} maxLength={200} rows={3} placeholder="예: 췌장염 병력, 체중 관리 중" className={field} />
      </label>
      <p className="rounded-xl bg-beige px-4 py-3 text-[16px]">
        체중과 건강 메모는 레시피의 주의사항 안내에 참고해요. 멍스푼은 체중만으로 급여량을 정해 드리지 않아요. 지병이 있다면 수의사와 먼저 상의해 주세요.
      </p>
      <BigButton type="submit">프로필 저장하기</BigButton>
      {msg && <p role="status" className="font-medium text-brown">{msg}</p>}
    </form>
  );
}
