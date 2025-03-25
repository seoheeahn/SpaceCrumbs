import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { loginSchema, type LoginInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog";

export default function Home() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const loginState = sessionStorage.getItem('user-login-state');
    if (loginState === 'true') {
      setLocation('/dashboard');
    }
  }, [setLocation]);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userId: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      setIsLoading(true);
      const response = await apiRequest("POST", "/api/login", data);
      const result = await response.json();

      if (response.ok) {
        form.reset();
        setIsDialogOpen(false);
        // Store login state
        sessionStorage.setItem('user-login-state', 'true');
        sessionStorage.setItem('user-id', data.userId);
        setLocation('/dashboard');
      } else {
        setShowErrorDialog(true);
      }
    } catch (error) {
      setShowErrorDialog(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg">
          <CardContent className="pt-6 text-center">
            <h1 className="text-4xl font-bold text-primary mb-4">
              우주먼지 좌표 찾기
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              20개의 심층 질문을 통해 당신의 우주좌표를 찾아보세요
            </p>
            <div className="space-y-4">
              <Link href="/test">
                <Button size="lg" className="w-full">
                  테스트 시작하기
                </Button>
              </Link>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <Button variant="outline" size="lg" className="w-full" onClick={() => setIsDialogOpen(true)}>
                  로그인
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>로그인</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="userId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>아이디</FormLabel>
                            <FormControl>
                              <Input placeholder="아이디를 입력하세요" {...field} />
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
                              <Input type="password" placeholder="비밀번호를 입력하세요" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        로그인
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그인 실패</AlertDialogTitle>
            <AlertDialogDescription>
              아이디 또는 비밀번호가 일치하지 않습니다.
              다시 한 번 확인해 주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end">
            <Button onClick={() => setShowErrorDialog(false)}>
              확인
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}