import { useState, useEffect } from "react";
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
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [isDuplicateId, setIsDuplicateId] = useState(false);
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [showDuplicateCheckAlert, setShowDuplicateCheckAlert] = useState(false);
  const progress = Math.max(0, (currentQuestion / questions.length) * 100);

  useEffect(() => {
    const loginState = sessionStorage.getItem('user-login-state');
    const storedUserId = sessionStorage.getItem('user-id');
    if (loginState === 'true' && storedUserId) {
      setIsLoggedIn(true);
      setUserId(storedUserId);
      setCurrentQuestion(0); // 로그인된 사용자는 바로 테스트 시작
    }
  }, []);

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

    try {
      // Create user first
      const response = await apiRequest("POST", "/api/users", data);

      if (!response.ok) {
        throw new Error("사용자 생성 중 오류가 발생했습니다");
      }

      // Store login state
      sessionStorage.setItem('user-login-state', 'true');
      sessionStorage.setItem('user-id', data.userId);
      setUserId(data.userId);
      setCurrentQuestion(0);
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "오류 발생",
        description: "사용자 생성 중 오류가 발생했습니다",
        variant: "destructive",
      });
    }
  };

  const handleAnswer = async (value: number) => {
    const newAnswer = { questionId: questions[currentQuestion].id, value };

    setAnswers(prevAnswers => {
      const answersCopy = [...prevAnswers];
      const existingIndex = answersCopy.findIndex(a => a.questionId === newAnswer.questionId);

      if (existingIndex !== -1) {
        answersCopy[existingIndex] = newAnswer;
      } else {
        answersCopy.push(newAnswer);
      }

      answersCopy.sort((a, b) => a.questionId - b.questionId);

      return answersCopy;
    });

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!userId) {
        throw new Error("사용자 정보를 찾을 수 없습니다");
      }

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
        userId,
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

  // 로그인하지 않은 경우 계정 생성 화면 표시
  if (currentQuestion === -1 && !isLoggedIn) {
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

              <h2 className="text-lg sm:text-xl font-semibold mb-6 sm:mb-8">
                {question?.text.ko}
              </h2>

              <div className="space-y-6">
                {/* PC: 가로형, Mobile: 세로형 레이아웃 */}
                <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-center">
                  {/* Option A */}
                  <div className="text-center sm:text-right order-1">
                    <div className="text-sm font-medium text-primary">
                      {question?.options.A}
                    </div>
                  </div>

                  {/* Answer Buttons */}
                  <div className="flex sm:grid sm:grid-cols-5 flex-col gap-2 order-3 sm:order-2">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Button
                        key={value}
                        variant={value === 3 ? "secondary" : "outline"}
                        onClick={() => handleAnswer(value)}
                        className={`
                          w-full h-12 sm:h-14 p-0 text-sm sm:text-base relative
                          ${value === 3 ? 'bg-primary/10' : ''}
                          hover:bg-primary/20 transition-colors
                        `}
                      >
                        {value === 1 && <span className="absolute sm:-top-6 -left-6 sm:left-auto text-xs text-gray-500">← A</span>}
                        {value === 3 && <span className="absolute sm:-top-6 text-xs text-gray-500">중립</span>}
                        {value === 5 && <span className="absolute sm:-top-6 -right-6 sm:right-auto text-xs text-gray-500">B →</span>}
                        {value}
                      </Button>
                    ))}
                  </div>

                  {/* Option B */}
                  <div className="text-center sm:text-left order-2 sm:order-3">
                    <div className="text-sm font-medium text-primary">
                      {question?.options.B}
                    </div>
                  </div>
                </div>
              </div>

              {currentQuestion === questions.length - 1 && answers.length === questions.length && (
                <Button
                  onClick={handleSubmit}
                  className="w-full mt-8"
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