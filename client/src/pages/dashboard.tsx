import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ClipboardCheck, UserCircle, LogOut, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const changePasswordSchema = z.object({
  newPassword: z.string().min(4, "비밀번호는 최소 4자 이상이어야 합니다"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "비밀번호가 일치하지 않습니다",
  path: ["confirmPassword"],
});

type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [deleteConfirmDialogOpen, setDeleteConfirmDialogOpen] = useState(false);
  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const userId = sessionStorage.getItem('user-id');

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('user-login-state') === 'true';
    if (!isLoggedIn) {
      setLocation('/');
    }
  }, [setLocation]);

  const { data: results } = useQuery<MbtiResult[]>({
    queryKey: [`/api/user/${userId}/mbti-results`],
    enabled: !!userId,
  });

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (resultId: number) => {
      const response = await apiRequest("DELETE", `/api/mbti-results/${resultId}`);
      if (!response.ok) {
        throw new Error("Failed to delete result");
      }
    },
    onSuccess: () => {
      queryClient.setQueryData([`/api/user/${userId}/mbti-results`], (oldData: MbtiResult[] | undefined) => {
        if (!oldData) return [];
        return oldData.filter(result => result.id !== selectedResultId);
      });

      toast({
        title: "삭제 완료",
        description: "테스트 결과가 성공적으로 삭제되었습니다.",
      });
      setDeleteConfirmDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "삭제 실패",
        description: "테스트 결과 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    sessionStorage.removeItem('user-login-state');
    sessionStorage.removeItem('user-id');
    setLocation('/');
  };

  const onSubmit = async (data: ChangePasswordInput) => {
    try {
      const response = await apiRequest("POST", `/api/user/change-password`, {
        userId,
        newPassword: data.newPassword,
      });

      if (response.ok) {
        toast({
          title: "비밀번호 변경 성공",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        });
        setIsProfileDialogOpen(false);
        form.reset();
      } else {
        toast({
          title: "비밀번호 변경 실패",
          description: "비밀번호 변경 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "서버와의 통신 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
      <div className="max-w-6xl mx-auto pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold">내 MBTI 테스트 결과</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsProfileDialogOpen(true)}
              >
                <UserCircle className="w-4 h-4 mr-2" />
                프로필
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-xl font-semibold">테스트 결과 목록</h2>
                <Link href="/test">
                  <Button>
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    새로운 테스트 응답하기
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>날짜</TableHead>
                          <TableHead>MBTI 유형</TableHead>
                          <TableHead>X</TableHead>
                          <TableHead>Y</TableHead>
                          <TableHead>Z</TableHead>
                          <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results?.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              {new Date(result.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {result.result}
                            </TableCell>
                            <TableCell>
                              {Number(result.coordinateX).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {Number(result.coordinateY).toFixed(2)}
                            </TableCell>
                            <TableCell>
                              {Number(result.coordinateZ).toFixed(2)}
                            </TableCell>
                            <TableCell className="space-y-2 sm:space-y-0 sm:text-right">
                              <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto"
                                  onClick={() => setLocation(`/result/${result.id}`)}
                                >
                                  결과 보기
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="w-full sm:w-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => {
                                    setSelectedResultId(result.id);
                                    setDeleteConfirmDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  삭제
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>비밀번호 변경</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>새 비밀번호</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="새 비밀번호 입력"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>새 비밀번호 확인</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="새 비밀번호 다시 입력"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsProfileDialogOpen(false)}
                    >
                      취소
                    </Button>
                    <Button type="submit">
                      변경
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <AlertDialog open={deleteConfirmDialogOpen} onOpenChange={setDeleteConfirmDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>결과 삭제</AlertDialogTitle>
                <AlertDialogDescription>
                  정말로 이 테스트 결과를 삭제하시겠습니까?
                  이 작업은 되돌릴 수 없습니다.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>취소</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => {
                    if (selectedResultId) {
                      deleteMutation.mutate(selectedResultId);
                    }
                  }}
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </motion.div>
      </div>
    </div>
  );
}