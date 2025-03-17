import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import type { MbtiResult } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";
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

export default function Admin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: results, isLoading } = useQuery<MbtiResult[]>({
    queryKey: ["/api/admin/mbti-results"],
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-primary/5 p-4">
      <div className="max-w-7xl mx-auto pt-4 sm:pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="pt-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-6">MBTI 결과 관리</h1>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">ID</TableHead>
                      <TableHead>사용자 ID</TableHead>
                      <TableHead>MBTI 유형</TableHead>
                      <TableHead>생성일</TableHead>
                      <TableHead className="w-32">X</TableHead>
                      <TableHead className="w-32">Y</TableHead>
                      <TableHead className="w-32">Z</TableHead>
                      <TableHead className="text-right">작업</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results?.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>{result.id}</TableCell>
                        <TableCell>{result.userId}</TableCell>
                        <TableCell className="font-semibold">{result.result}</TableCell>
                        <TableCell>
                          {new Date(result.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{Number(result.coordinateX).toFixed(2)}</TableCell>
                        <TableCell>{Number(result.coordinateY).toFixed(2)}</TableCell>
                        <TableCell>{Number(result.coordinateZ).toFixed(2)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => recalculateMutation.mutate(result.id)}
                              disabled={recalculateMutation.isPending}
                            >
                              <RefreshCw className="w-4 h-4 mr-1" />
                              재계산
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setLocation(`/result/${result.id}`)}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              보기
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}