import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink, Sparkles, Users, UserPlus, Menu } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { adminLoginSchema, type AdminLoginInput, adminCreationSchema, type CreateAdminInput } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AdminView = "results" | "createAdmin";

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<AdminView>("results");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load admin login state from sessionStorage on mount
  useEffect(() => {
    const savedAdminLoginState = sessionStorage.getItem('admin-login-state');
    if (savedAdminLoginState === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Always define hooks at the top level
  const { data: results, isLoading } = useQuery<MbtiResult[]>({
    queryKey: ["/api/admin/mbti-results"],
    enabled: isAuthenticated,
  });

  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: AdminLoginInput) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      // Save admin login state to sessionStorage with longer expiration
      sessionStorage.setItem('admin-login-state', 'true');
      toast({
        title: "로그인 성공",
        description: "관리자 페이지에 접속했습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "로그인 실패",
        description: "아이디 또는 비밀번호를 확인해주세요.",
        variant: "destructive",
      });
    },
  });

  const recalculateMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/admin/recalculate/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mbti-results"] });
      toast({
        title: "재계산 완료",
        description: "MBTI 유형이 성공적으로 재계산되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "재계산 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/admin/reanalyze/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/mbti-results"] });
      toast({
        title: "재분석 완료",
        description: "AI 분석이 성공적으로 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: "AI 재분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const createAdminForm = useForm<CreateAdminInput>({
    resolver: zodResolver(adminCreationSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: async (data: CreateAdminInput) => {
      const response = await apiRequest("POST", "/api/admin/create", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "관리자 계정 생성 성공",
        description: "새로운 관리자 계정이 생성되었습니다.",
      });
      createAdminForm.reset();
    },
    onError: (error) => {
      toast({
        title: "관리자 계정 생성 실패",
        description: "계정 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
        <div className="max-w-md mx-auto pt-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="pt-6">
                <h2 className="text-xl font-semibold mb-6">관리자 로그인</h2>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>아이디</FormLabel>
                          <FormControl>
                            <Input placeholder="관리자 아이디" {...field} />
                          </FormControl>
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
                            <Input type="password" placeholder="관리자 비밀번호" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginMutation.isPending}
                    >
                      로그인
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <p>데이터를 불러오는 중...</p>
        </div>
      );
    }

    switch (currentView) {
      case "results":
        return (
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-6">MBTI 결과 관리</h1>
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">ID</TableHead>
                          <TableHead>사용자 ID</TableHead>
                          <TableHead>MBTI</TableHead>
                          <TableHead className="hidden sm:table-cell">생성일</TableHead>
                          <TableHead className="hidden lg:table-cell">X</TableHead>
                          <TableHead className="hidden lg:table-cell">Y</TableHead>
                          <TableHead className="hidden lg:table-cell">Z</TableHead>
                          <TableHead className="text-right">작업</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {results?.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>{result.id}</TableCell>
                            <TableCell>{result.userId}</TableCell>
                            <TableCell className="font-semibold">{result.result}</TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {new Date(result.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">{Number(result.coordinateX).toFixed(2)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{Number(result.coordinateY).toFixed(2)}</TableCell>
                            <TableCell className="hidden lg:table-cell">{Number(result.coordinateZ).toFixed(2)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => recalculateMutation.mutate(result.id)}
                                  disabled={recalculateMutation.isPending}
                                >
                                  <RefreshCw className="w-4 h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">재계산</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => reanalyzeMutation.mutate(result.id)}
                                  disabled={reanalyzeMutation.isPending}
                                >
                                  <Sparkles className="w-4 h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">재분석</span>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setLocation(`/result/${result.id}?isAdmin=true`)}
                                >
                                  <ExternalLink className="w-4 h-4 sm:mr-1" />
                                  <span className="hidden sm:inline">보기</span>
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
        );

      case "createAdmin":
        return (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-6">관리자 계정 생성</h2>
              <Form {...createAdminForm}>
                <form onSubmit={createAdminForm.handleSubmit((data) => createAdminMutation.mutate(data))} className="space-y-4">
                  <FormField
                    control={createAdminForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>아이디</FormLabel>
                        <FormControl>
                          <Input placeholder="새 관리자 아이디" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={createAdminForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>비밀번호</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="새 관리자 비밀번호" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createAdminMutation.isPending}
                  >
                    관리자 계정 생성
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white shadow-sm px-4 flex items-center z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-6 w-6" />
        </Button>
        <span className="ml-4 font-semibold">관리자 메뉴</span>
      </div>

      <div className="flex min-h-screen pt-16 lg:pt-0">
        {/* Sidebar */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 
          w-64 bg-white shadow-lg transform 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 transition-transform duration-200 ease-in-out
        `}>
          <div className="p-4 pt-20 lg:pt-4">
            <h2 className="text-lg font-semibold text-primary mb-4">관리자 메뉴</h2>
            <nav className="space-y-2">
              <Button
                variant={currentView === "results" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentView("results");
                  setIsSidebarOpen(false);
                }}
              >
                <Users className="w-4 h-4 mr-2" />
                MBTI 결과 관리
              </Button>
              <Button
                variant={currentView === "createAdmin" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setCurrentView("createAdmin");
                  setIsSidebarOpen(false);
                }}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                관리자 계정 생성
              </Button>
            </nav>
          </div>
        </div>

        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 lg:hidden z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-8 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
}