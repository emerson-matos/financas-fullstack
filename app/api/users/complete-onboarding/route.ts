import { createErrorResponse, createSuccessResponse } from "@/lib/api/handlers";
import { requireAuth } from "@/lib/api/auth";
import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

/**
 * PUT /api/users/complete-onboarding - Mark current user's onboarding as complete
 * Updates user_metadata in auth.users
 * Stores preferences in user_preferences table
 * Creates the user's first account
 */
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await requireAuth();
    const supabase = await createClient();
    const body = await request.json();

    const {
      preferredCurrency,
      budgetingGoals,
      notificationPreferences,
      financialGoals,
      firstAccount,
    } = body;

    // 1. Update user metadata to mark onboarding as complete
    const { data: authData, error: authError } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
      },
    });

    if (authError) throw authError;

    // 2. Store preferences in user_preferences table
    const { error: prefsError } = await supabase
      .from("user_preferences")
      .upsert({
        user_id: userId,
        default_currency: preferredCurrency,
        budgeting_goals: budgetingGoals,
        notification_preferences: notificationPreferences,
        financial_goals: financialGoals,
      });

    if (prefsError) {
      console.error("Error saving user preferences:", prefsError);
    }

    // 3. Create the first account if configured
    if (firstAccount) {
      // Check if an account with this name already exists for the user
      const { data: existingAccount } = await supabase
        .from("user_accounts")
        .select("id")
        .eq("user_id", userId)
        .eq("identification", firstAccount.name)
        .single();

      if (!existingAccount) {
        const { error: createError } = await supabase
          .from("user_accounts")
          .insert({
            user_id: userId,
            identification: firstAccount.name,
            kind: firstAccount.kind,
            currency: preferredCurrency || "BRL",
            created_by: userId,
          });

        if (createError) {
          console.error("Error creating first account:", createError);
        }
      }
      
      // Note: We could also create an initial transaction here if initialAmount > 0
      // For now, keeping it simple as per implementation plan
    }

    // Return updated user info
    const userMetadata = authData.user.user_metadata || {};
    return createSuccessResponse({
      id: authData.user.id,
      email: authData.user.email,
      name: userMetadata.full_name || userMetadata.name || null,
      onboarding_completed: true,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

