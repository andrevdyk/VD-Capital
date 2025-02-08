"use client";

import {
  useState,
  useEffect,
} from "react";
import {
  motion,
  AnimatePresence,
} from "framer-motion";
import {
  toggleFollow,
  getFollowStatus,
} from "../../actions/follows";
import confetti from "canvas-confetti";

export function FollowButton({
  followerId,
  followingId,
}: {
  followerId: string;
  followingId: string;
}) {
  const [isFollowing, setIsFollowing] =
    useState<boolean | undefined>(
      undefined
    );
  const [isLoading, setIsLoading] =
    useState(true);

  useEffect(() => {
    const checkFollowStatus =
      async () => {
        const result =
          await getFollowStatus(
            followerId,
            followingId
          );
        if (result.success) {
          setIsFollowing(
            result.isFollowing
          );
        }
        setIsLoading(false);
      };
    checkFollowStatus();
  }, [followerId, followingId]);

  const triggerFireworks = () => {
    const duration = 5 * 1000;
    const animationEnd =
      Date.now() + duration;
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    };

    const randomInRange = (
      min: number,
      max: number
    ) =>
      Math.random() * (max - min) + min;

    const interval = window.setInterval(
      () => {
        const timeLeft =
          animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(
            interval
          );
        }

        const particleCount =
          50 * (timeLeft / duration);
        // First burst
        confetti({
          ...defaults,
          particleCount,
          origin: {
            x: randomInRange(0.1, 0.3),
            y: Math.random() - 0.2,
          },
          colors: [
            "#1d4ed8",
            "#60a5fa",
            "#93c5fd",
            "#f472b6",
            "#ec4899",
          ],
        });
        // Second burst
        confetti({
          ...defaults,
          particleCount,
          origin: {
            x: randomInRange(0.7, 0.9),
            y: Math.random() - 0.2,
          },
          colors: [
            "#1d4ed8",
            "#60a5fa",
            "#93c5fd",
            "#f472b6",
            "#ec4899",
          ],
        });
      },
      250
    );
  };

  const handleToggleFollow =
    async () => {
      setIsLoading(true);
      const result = await toggleFollow(
        followerId,
        followingId
      );
      if (
        result.success &&
        typeof result.isFollowing ===
          "boolean"
      ) {
        setIsFollowing(
          result.isFollowing
        );
        if (result.isFollowing) {
          triggerFireworks();
        }
      }
      setIsLoading(false);
    };

  if (
    isLoading ||
    isFollowing === undefined
  ) {
    return (
      <motion.button
        className="relative flex h-10 w-28 items-center justify-center rounded-lg bg-muted text-muted-foreground"
        disabled
      >
        Loading...
      </motion.button>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.button
        key={
          isFollowing
            ? "following"
            : "follow"
        }
        onClick={handleToggleFollow}
        className={`relative flex h-10 w-28 items-center justify-center rounded-lg ${
          isFollowing
            ? "bg-secondary text-secondary-foreground hover:bg-destructive hover:text-destructive-foreground"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        <motion.span
          key={
            isFollowing
              ? "unfollow-text"
              : "follow-text"
          }
          initial={{
            y: 20,
            opacity: 0,
          }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute"
        >
          {isFollowing
            ? "Unfollow"
            : "Follow"}
        </motion.span>
      </motion.button>
    </AnimatePresence>
  );
}
