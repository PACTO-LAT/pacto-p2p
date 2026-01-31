"use client";

import { AlertCircle, Camera, CheckCircle, User, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/lib/supabase";

import { ProfileData } from "./types";

interface ProfileInfoProps {
	userData: ProfileData;
	isEditing: boolean;
	onUserDataChange: (data: ProfileData) => void;
}

export function ProfileInfo({
	userData,
	isEditing,
	onUserDataChange,
}: ProfileInfoProps) {
	const [avatarPreview, setAvatarPreview] = useState<string>(
		userData.avatar_url || "",
	);

	const getKycStatusBadge = () => {
		switch (userData.kyc_status) {
			case "verified":
				return (
					<Badge className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'>
						<CheckCircle className='w-3 h-3 mr-1' />
						Verified
					</Badge>
				);
			case "pending":
				return (
					<Badge className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'>
						<AlertCircle className='w-3 h-3 mr-1' />
						Pending
					</Badge>
				);
			case "rejected":
				return (
					<Badge className='bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'>
						<AlertCircle className='w-3 h-3 mr-1' />
						Rejected
					</Badge>
				);
		}
	};

	return (
		<Card className='feature-card'>
			<CardHeader>
				<CardTitle className='flex items-center gap-2 text-foreground'>
					<User className='w-5 h-5 text-emerald-400' />
					Personal Information
				</CardTitle>
				<CardDescription>
					Your basic information and contact details
				</CardDescription>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Avatar Upload Section */}
				{isEditing ? (
					<div className='space-y-2'>
						<Label className='mb-2 block'>Profile picture</Label>
						<div className='flex items-center gap-3'>
							<div className='size-20 overflow-hidden rounded-md border relative'>
								{avatarPreview ? (
									<Image
										src={avatarPreview}
										alt='Avatar preview'
										fill
										sizes='80px'
										className='object-cover'
									/>
								) : (
									<div className='h-full w-full bg-muted flex items-center justify-center'>
										<User className='w-8 h-8 text-muted-foreground' />
									</div>
								)}
							</div>
							<input
								type='file'
								accept='image/*'
								onChange={async (e) => {
									const file = e.target.files?.[0];
									if (!file) return;
									try {
										// Generate path with user ID and timestamp
										const timestamp = Date.now();
										const fileExt = file.name.split(".").pop();
										const path = `avatars/${userData.id}-${timestamp}.${fileExt}`;

										const { error } = await supabase.storage
											.from("user-avatars")
											.upload(path, file, { upsert: true });

										if (error) throw error;

										const { data } = supabase.storage
											.from("user-avatars")
											.getPublicUrl(path);

										onUserDataChange({
											...userData,
											avatar_url: data.publicUrl,
										});
										setAvatarPreview(data.publicUrl);
										toast.success("Avatar uploaded");
									} catch (err) {
										console.error(err);
										toast.error("Failed to upload avatar");
									}
								}}
							/>
							{avatarPreview ? (
								<Button
									type='button'
									variant='ghost'
									size='icon'
									onClick={() => {
										onUserDataChange({
											...userData,
											avatar_url: "",
										});
										setAvatarPreview("");
									}}>
									<X className='size-4' />
								</Button>
							) : null}
						</div>
					</div>
				) : (
					/* Avatar Display (Non-editing mode) */
					<div className='flex items-center gap-4'>
						<Avatar className='w-20 h-20'>
							<AvatarImage
								src={userData.avatar_url || "/placeholder.svg"}
							/>
							<AvatarFallback className='text-lg'>
								{userData.full_name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
					</div>
				)}

				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					<div className='space-y-2'>
						<Label
							htmlFor='full_name'
							className='text-sm font-medium text-muted-foreground'>
							Full Name
						</Label>
						<Input
							id='full_name'
							value={userData.full_name}
							onChange={(e) =>
								onUserDataChange({
									...userData,
									full_name: e.target.value,
								})
							}
							disabled={!isEditing}
							className='glass-effect-light'
						/>
					</div>
					<div className='space-y-2'>
						<Label
							htmlFor='username'
							className='text-sm font-medium text-muted-foreground'>
							Username
						</Label>
						<Input
							id='username'
							value={userData.username}
							onChange={(e) =>
								onUserDataChange({
									...userData,
									username: e.target.value,
								})
							}
							disabled={!isEditing}
							className='glass-effect-light'
						/>
					</div>
					<div className='space-y-2'>
						<Label
							htmlFor='email'
							className='text-sm font-medium text-muted-foreground'>
							Email
						</Label>
						<Input
							id='email'
							type='email'
							value={userData.email}
							onChange={(e) =>
								onUserDataChange({
									...userData,
									email: e.target.value,
								})
							}
							disabled={!isEditing}
							className='glass-effect-light'
						/>
					</div>
					<div className='space-y-2'>
						<Label
							htmlFor='phone'
							className='text-sm font-medium text-muted-foreground'>
							Phone
						</Label>
						<Input
							id='phone'
							value={userData.phone}
							onChange={(e) =>
								onUserDataChange({ ...userData, phone: e.target.value })
							}
							disabled={!isEditing}
							className='glass-effect-light'
						/>
					</div>
					<div className='space-y-2'>
						<Label
							htmlFor='country'
							className='text-sm font-medium text-muted-foreground'>
							Country
						</Label>
						<Input
							id='country'
							value={userData.country}
							onChange={(e) =>
								onUserDataChange({
									...userData,
									country: e.target.value,
								})
							}
							disabled={!isEditing}
							className='glass-effect-light'
						/>
					</div>
					<div className='space-y-2'>
						<Label className='text-sm font-medium text-muted-foreground'>
							KYC Status
						</Label>
						<div className='flex items-center gap-2'>
							{getKycStatusBadge()}
							{userData.kyc_status !== "verified" && (
								<Button
									variant='link'
									size='sm'
									className='p-0 h-auto'>
									Complete KYC
								</Button>
							)}
						</div>
					</div>
				</div>

				<div className='space-y-2'>
					<Label
						htmlFor='bio'
						className='text-sm font-medium text-muted-foreground'>
						Biography
					</Label>
					<Textarea
						id='bio'
						value={userData.bio}
						onChange={(e) =>
							onUserDataChange({ ...userData, bio: e.target.value })
						}
						disabled={!isEditing}
						rows={3}
						placeholder='Tell us about yourself and your trading experience...'
						className='glass-effect-light'
					/>
				</div>
			</CardContent>
		</Card>
	);
}
