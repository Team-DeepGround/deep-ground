"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AVAILABLE_TECH_TAGS } from "@/lib/constants/tech-tags"

          <Tabs defaultValue="info">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info">스터디 정보</TabsTrigger>
              <TabsTrigger value="schedule">일정 관리</TabsTrigger>
              <TabsTrigger value="members">참여자 관리</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader>
                  <CardTitle>스터디 정보</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">스터디 제목</Label>
                      <Input
                        id="title"
                        {...register("title", { required: "제목을 입력해주세요" })}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">스터디 설명</Label>
                      <Textarea
                        id="description"
                        {...register("description", { required: "설명을 입력해주세요" })}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>스터디 기간</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="studyStartDate">시작일</Label>
                          <Input
                            id="studyStartDate"
                            type="date"
                            {...register("studyStartDate", { required: "시작일을 선택해주세요" })}
                          />
                          {errors.studyStartDate && (
                            <p className="text-sm text-red-500">{errors.studyStartDate.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="studyEndDate">종료일</Label>
                          <Input
                            id="studyEndDate"
                            type="date"
                            {...register("studyEndDate", { required: "종료일을 선택해주세요" })}
                          />
                          {errors.studyEndDate && (
                            <p className="text-sm text-red-500">{errors.studyEndDate.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>모집 기간</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="recruitStartDate">시작일</Label>
                          <Input
                            id="recruitStartDate"
                            type="date"
                            {...register("recruitStartDate", { required: "시작일을 선택해주세요" })}
                          />
                          {errors.recruitStartDate && (
                            <p className="text-sm text-red-500">{errors.recruitStartDate.message}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="recruitEndDate">종료일</Label>
                          <Input
                            id="recruitEndDate"
                            type="date"
                            {...register("recruitEndDate", { required: "종료일을 선택해주세요" })}
                          />
                          {errors.recruitEndDate && (
                            <p className="text-sm text-red-500">{errors.recruitEndDate.message}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>스터디 방식</Label>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isOnline"
                          {...register("isOnline")}
                        />
                        <Label htmlFor="isOnline">온라인 스터디</Label>
                      </div>
                    </div>

                    {!watch("isOnline") && (
                      <div className="space-y-2">
                        <Label htmlFor="location">오프라인 장소</Label>
                        <Input
                          id="location"
                          {...register("location", { required: "장소를 입력해주세요" })}
                        />
                        {errors.location && (
                          <p className="text-sm text-red-500">{errors.location.message}</p>
                        )}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="groupLimit">모집 인원</Label>
                      <Input
                        id="groupLimit"
                        type="number"
                        min="2"
                        max="20"
                        {...register("groupLimit", {
                          required: "모집 인원을 입력해주세요",
                          min: { value: 2, message: "최소 2명 이상이어야 합니다" },
                          max: { value: 20, message: "최대 20명까지 가능합니다" },
                        })}
                      />
                      {errors.groupLimit && (
                        <p className="text-sm text-red-500">{errors.groupLimit.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>기술 스택</Label>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_TECH_TAGS.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTags.includes(tag) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => handleTagToggle(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" className="w-full">
                      저장하기
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              <Card>
                <CardHeader>
                  <CardTitle>일정 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>일정 관리 기능은 준비 중입니다.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="members">
              <Card>
                <CardHeader>
                  <CardTitle>참여자 관리</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>참여자 관리 기능은 준비 중입니다.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs> 