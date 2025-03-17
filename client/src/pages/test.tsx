import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send } from "lucide-react";
import { questions } from "@/lib/questions";
import { calculateMbti } from "@/lib/mbti";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput, type Answer } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

export default function Test() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [currentQuestion, setCurrentQuestion] = useState(-1); // -1 means login form
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [userCredentials, setUserCredentials] = useState<LoginInput | null>(null);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isDuplicateId, setIsDuplicateId] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [showDuplicateCheckAlert, setShowDuplicateCheckAlert] = useState(false);
  const progress = Math.max(0, (currentQuestion / questions.length) * 100);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const checkDuplicateId = async (userId: string) => {
    try {
      setIsCheckingId(true);
      const response = await fetch(`/api/check-user-id/${userId}`);
      const data = await response.json();
      setIsDuplicateId(data.isDuplicate);
      setIsIdChecked(true);

      if (data.isDuplicate) {
        form.setError("userId", {
          type: "manual",
          message: "이미 사용 중인 아이디입니다"
        });
      } else {
        form.clearErrors("userId");
        toast({
          title: "사용 가능한 아이디",
          description: "입력하신 아이디를 사용할 수 있습니다.",
        });
      }
    } catch (error) {
      console.error("Error checking user ID:", error);
      toast({
        title: "오류 발생",
        description: "아이디 중복 확인 중 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsCheckingId(false);
    }
  };

  const handleLoginSubmit = async (data: LoginInput) => {
    if (!isIdChecked) {
      setShowDuplicateCheckAlert(true);
      return;
    }

    if (isDuplicateId) {
      toast({
        title: "사용할 수 없는 아이디",
        description: "다른 아이디를 사용해주세요.",
        variant: "destructive",
      });
      return;
    }

    setUserCredentials(data);
    setCurrentQuestion(0);
  };

  const handleAnswer = async (value: number) => {
    const newAnswer = { questionId: questions[currentQuestion].id, value };

    // Update answers array, replacing any existing answer for this question
    setAnswers(prevAnswers => {
      const answersCopy = [...prevAnswers];
      const existingIndex = answersCopy.findIndex(a => a.questionId === newAnswer.questionId);

      if (existingIndex !== -1) {
        // Replace existing answer
        answersCopy[existingIndex] = newAnswer;
      } else {
        // Add new answer
        answersCopy.push(newAnswer);
      }

      // Sort answers by questionId to maintain order
      answersCopy.sort((a, b) => a.questionId - b.questionId);

      console.log("Updated answers:", answersCopy); // Debug log
      return answersCopy;
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!userCredentials) {
        throw new Error("User credentials not found");
      }

      // Verify we have exactly one answer per question
      if (answers.length !== questions.length) {
        toast({
          title: "응답 확인",
          description: "모든 문항에 응답해주세요.",
          variant: "destructive",
        });
        return;
      }

      const mbtiType = calculateMbti(answers);
      const response = await apiRequest("POST", "/api/mbti-results", {
        ...userCredentials,
        answers,
        result: mbtiType,
        language: "ko",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "서버 오류가 발생했습니다");
      }

      const result = await response.json();
      if (!result.id) {
        throw new Error("Invalid response from server");
      }

      setLocation(`/result/${result.id}`);
    } catch (error) {
      console.error("Error submitting answers:", error);
      toast({
        title: "오류 발생",
        description: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  if (currentQuestion === -1) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
        <div className="max-w-md mx-auto pt-4 sm:pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
                  테스트를 시작하기 전에
                </h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleLoginSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="userId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>아이디</FormLabel>
                          <div className="flex gap-2">
                            <FormControl>
                              <Input
                                placeholder="영문, 숫자 조합 4-20자"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e);
                                  setIsDuplicateId(false);
                                  setIsIdChecked(false);
                                }}
                                className="flex-1"
                              />
                            </FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => checkDuplicateId(field.value)}
                              disabled={isCheckingId || !field.value || field.value.length < 4}
                              className="whitespace-nowrap"
                            >
                              중복확인
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>비밀번호</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="결과 조회시 사용할 비밀번호"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!isIdChecked || isDuplicateId || isCheckingId}
                    >
                      테스트 시작하기
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AlertDialog open={showDuplicateCheckAlert} onOpenChange={setShowDuplicateCheckAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>중복확인 필요</AlertDialogTitle>
              <AlertDialogDescription>
                아이디 중복확인을 먼저 진행해주세요.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => setShowDuplicateCheckAlert(false)}>
                확인
              </Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
      <div className="max-w-2xl mx-auto pt-4 sm:pt-8">
        <Progress value={progress} className="mb-4 sm:mb-8" />

        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Button
                  variant="ghost"
                  onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestion === 0}
                  className="text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  이전으로
                </Button>
                <span className="text-sm text-gray-500">
                  {currentQuestion + 1} / {questions.length}
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">
                {question.text.ko}
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Options and Buttons - Stacks vertically on very small screens */}
                <div className="flex flex-col md:grid md:grid-cols-[minmax(120px,1fr),auto,minmax(120px,1fr)] gap-4 items-center">
                  {/* Option A */}
                  <div className="text-center md:text-left w-full md:w-auto text-sm">
                    <p className="min-h-[2.5rem] flex items-center justify-center md:justify-start">
                      {question.options.A}
                    </p>
                  </div>

                  {/* Answer Buttons */}
                  <div className="grid grid-cols-5 gap-2 w-full md:w-auto">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant="secondary"
                        onClick={() => handleAnswer(value)}
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-10 md:h-10 p-0 text-sm sm:text-base"
                      >
                        {value}
                      </Button>
                    ))}
                  </div>

                  {/* Option B */}
                  <div className="text-center md:text-right w-full md:w-auto text-sm">
                    <p className="min-h-[2.5rem] flex items-center justify-center md:justify-end">
                      {question.options.B}
                    </p>
                  </div>
                </div>

                {/* Labels */}
                <div className="text-xs text-gray-500 flex md:grid md:grid-cols-[1fr,auto,1fr] gap-4 justify-between items-center">
                  <div className="text-center md:text-left">매우 그렇다</div>
                  <div className="text-center">중립</div>
                  <div className="text-center md:text-right">매우 그렇다</div>
                </div>
              </div>

              {currentQuestion === questions.length - 1 && answers.length === questions.length && (
                <Button
                  onClick={handleSubmit}
                  className="w-full mt-6"
                >
                  <Send className="w-4 h-4 mr-2" />
                  결과 제출하기
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}