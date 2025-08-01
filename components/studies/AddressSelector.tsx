"use client"

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { api } from "@/lib/api-client";

interface AddressDto {
  id: number | null;
  city: string;
  gu: string;
  dong: string | null;
}

interface AddressSelectorProps {
  selectedAddressIds: number[];
  onChange: (ids: number[]) => void;
}

export function AddressSelector({ selectedAddressIds, onChange }: AddressSelectorProps) {
  const [cities, setCities] = useState<AddressDto[]>([]);
  const [gus, setGus] = useState<AddressDto[]>([]);
  const [dongs, setDongs] = useState<AddressDto[]>([]);

  // 선택된 동 상세 정보를 별도로 관리
  const [selectedAddresses, setSelectedAddresses] = useState<AddressDto[]>([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedGu, setSelectedGu] = useState("");

  // 시 목록 로드
  useEffect(() => {
    api.get("/addresses/cities").then((res) => {
      setCities(res.result);
    });
  }, []);

  // 구 목록 로드
  useEffect(() => {
    if (selectedCity) {
      api.get(`/addresses/gus?city=${selectedCity}`).then((res) => {
        setGus(res.result);
        setSelectedGu("");
        setDongs([]);
      });
    } else {
      setGus([]);
      setSelectedGu("");
      setDongs([]);
    }
  }, [selectedCity]);

  // 동 목록 로드
  useEffect(() => {
    if (selectedCity && selectedGu) {
      api.get(`/addresses/dongs?city=${selectedCity}&gu=${selectedGu}`).then((res) => {
        setDongs(res.result);
      });
    } else {
      setDongs([]);
    }
  }, [selectedCity, selectedGu]);

  // selectedAddressIds 상태 변경에 맞춰 selectedAddresses 동기화
  // 선택된 id들로부터 이름 등 상세정보를 동기화
  useEffect(() => {
    // 현재 selectedAddressIds에 없어진 id는 제거, 새로 추가된 id는 dongs 데이터에서 찾기
    setSelectedAddresses(prevSelected => {
      // 필터해서 현재 id 목록에 있는 것만 남기기
      const filtered = prevSelected.filter(addr => selectedAddressIds.includes(addr.id ?? -1));

      // id 중에서 prevSelected에 없는 id 찾아서 추가
      const missingIds = selectedAddressIds.filter(id => !filtered.some(addr => addr.id === id));

      const missingAddresses = dongs.filter(dong => dong.id !== null && missingIds.includes(dong.id));

      return [...filtered, ...missingAddresses];
    });
  }, [selectedAddressIds, dongs]);

  // 동 선택 추가
  const handleAddDong = (dong: AddressDto) => {
    if (dong.dong && dong.id !== null && !selectedAddressIds.includes(dong.id)) {
      const newIds = [...selectedAddressIds, dong.id];
      onChange(newIds);

      // selectedAddresses는 useEffect에서 자동 동기화 됨
    }
  };

  // 선택 제거
  const handleRemoveDong = (id: number) => {
    const newIds = selectedAddressIds.filter((d) => d !== id);
    onChange(newIds);

    // selectedAddresses는 useEffect에서 자동 동기화 됨
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">스터디 장소</label>
      <div className="flex gap-2">
        {/* 시 선택 */}
        <Select value={selectedCity} onValueChange={setSelectedCity}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="시" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((cityObj, index) => (
              <SelectItem key={cityObj.id ?? `city-${index}`} value={cityObj.city ?? ""}>
                {cityObj.city ?? "Unknown City"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 구 선택 */}
        <Select value={selectedGu} onValueChange={setSelectedGu} disabled={!selectedCity}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="구" />
          </SelectTrigger>
          <SelectContent>
            {gus.map((guObj, index) => (
              <SelectItem key={guObj.id ?? `gu-${index}`} value={guObj.gu ?? ""}>
                {guObj.gu ?? "Unknown Gu"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 동 선택 */}
        <Select
          value={""} // 빈 문자열로 값 고정해서 여러번 선택 가능하게
          onValueChange={(id) => {
            const dong = dongs.find((d) => d.id?.toString() === id);
            if (dong) {
              handleAddDong(dong);
            }
          }}
          disabled={!selectedGu}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="동" />
          </SelectTrigger>
          <SelectContent>
            {dongs
              .filter((dong) => typeof dong.dong === "string" && dong.dong.trim() !== "" && dong.id !== null)
              .map((dong, index) => (
                <SelectItem key={dong.id ?? `dong-${index}`} value={dong.id?.toString() ?? ""}>
                  {dong.dong}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* 선택된 동 리스트 */}
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedAddresses.map((dong, index) => {
          if (!dong?.dong) return null;
          return (
            <Badge key={dong.id ?? `selected-${index}`} variant="secondary" className="flex items-center gap-1">
              {dong.dong}
              <X className="h-3 w-3 cursor-pointer" onClick={() => dong.id !== null && handleRemoveDong(dong.id)} />
            </Badge>
          );
        })}
      </div>
    </div>
  );
}
