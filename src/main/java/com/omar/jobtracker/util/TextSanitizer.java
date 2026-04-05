package com.omar.jobtracker.util;

import java.util.regex.Pattern;

/**
 * Strips HTML-like tags from plain-text fields before persistence.
 * Annotations alone do not sanitize input; doing this in the service keeps
 * one consistent place for XSS mitigation for stored text.
 */
public final class TextSanitizer {

    private static final Pattern HTML_TAG = Pattern.compile("<[^>]*>");

    private TextSanitizer() {
    }

    public static String stripHtmlTags(String value) {
        if (value == null || value.isEmpty()) {
            return value;
        }
        return HTML_TAG.matcher(value).replaceAll("").trim();
    }
}
