import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
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
              MBTI 심층 분석
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              20개의 심층 질문을 통해 당신의 성격 유형을 정확하게 분석해보세요
            </p>
            <Link href="/test">
              <Button size="lg" className="w-full">
                테스트 시작하기
              </Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
